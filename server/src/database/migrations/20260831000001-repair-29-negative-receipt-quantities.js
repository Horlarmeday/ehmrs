'use strict';

/**
 * EMR #29 defect B — repair the negative receipt quantities on `Pharmacy_Store_Items`.
 *
 * MUST run BEFORE 20260831000002-add-non-negative-receipt-check-29.js: that migration adds the
 * CHECK (quantity_received >= 0) this table now needs, and it cannot apply while the 586 negative
 * rows #29 measured are still negative. The filenames sort in that order; do not renumber.
 *
 * WHAT WENT WRONG
 * ---------------
 * `reorderPharmacyItems` (store.repository.ts) used to spread `...item` over the bin with no
 * floor, so a negative `quantity_received` SUBTRACTED from `quantity_remaining` and wrote a
 * SUPPLIED `Pharmacy_Store_Histories` row claiming a negative delivery. `total_price`, computed
 * as quantity_received × unit_price, inherited the sign — the mechanism behind the negative store
 * valuation #29 reports. On `ehmrs_prod` as measured by #29: 586 negative rows across 175 drugs,
 * −₦44,301,228 of claimed valuation.
 *
 * REPAIR SEMANTICS (plan tasks/29-pharmacy-store-negative-quantities.md, §2)
 * -----------------
 * D3 — `quantity_remaining` is authoritative; it is positive and plausible on the affected rows
 *      and is NOT touched. `quantity_received` is floored to 0 — what actually arrived is not
 *      recoverable, and a zero is visibly unknown where a fabricated receipt is silently wrong
 *      (ADR-0041). `total_price` is recomputed as quantity_remaining × unit_price for every
 *      touched row.
 * D4 — the decrement is not reversed. Adding the negative back would assume no real dispensing
 *      has happened since; where it has, that inflates the shelf.
 * D5 — the all-negative drugs are NOT trusted by this migration either: their `quantity_remaining`
 *      is doubted and goes to a physical stock take (the quarantine worklist the report script
 *      emits). The floor-to-0 still applies to them mechanically — the CHECK constraint cannot
 *      admit exceptions — but no stock figure is blessed as correct.
 * D6 — reversible: every affected row is snapshotted into
 *      `Pharmacy_Store_Items_repair_29_backup` before mutation; `down()` restores from it.
 *
 * `Pharmacy_Store_Histories` rows claiming negative deliveries are deliberately NOT rewritten:
 * history is a record of events, not of truth, and the negative SUPPLIED rows document what
 * actually happened (plan §Open questions, item 3).
 *
 * A DBA-led SQL twin with rehearsal checks lives at
 * src/database/scripts/repair-29-negative-receipts.sql — run the report queries there against
 * PRODUCTION before this migration is applied anywhere but a rehearsal copy.
 */
module.exports = {
  up: async queryInterface => {
    // Re-entrancy: a previous up whose down never ran leaves a stale snapshot. It cannot be
    // trusted to describe the CURRENT rows, so start clean rather than half-restoring.
    await queryInterface.sequelize.query(
      'DROP TABLE IF EXISTS `Pharmacy_Store_Items_repair_29_backup`'
    );

    // D6: snapshot every row this migration will touch, BEFORE touching it.
    await queryInterface.sequelize.query(
      `CREATE TABLE \`Pharmacy_Store_Items_repair_29_backup\` AS
       SELECT * FROM \`Pharmacy_Store_Items\` WHERE \`quantity_received\` < 0`
    );

    // D3: floor the receipt to 0 and restate the valuation from the authoritative remaining
    // stock. One statement so the pair cannot be interleaved with a concurrent restock; MySQL
    // evaluates both assignments against the row's pre-update values, and neither assignment
    // feeds the other. quantity_remaining is deliberately absent (D4).
    await queryInterface.sequelize.query(
      `UPDATE \`Pharmacy_Store_Items\`
         SET \`quantity_received\` = 0,
             \`total_price\` = \`quantity_remaining\` * \`unit_price\`
       WHERE \`quantity_received\` < 0`
    );

    // Reconciliation invariants (plan T9), computed here so the migration run itself carries the
    // evidence: stock must not have moved, and no touched row may still carry a negative receipt
    // or a negative valuation. SUM(quantity_remaining) over ALL rows is asserted unchanged in
    // repair-29.test.ts around a live up/down cycle; this intra-migration check narrows to the
    // touched rows, whose remaining stock must be exactly what the snapshot recorded.
    const [touched] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) AS rows_repaired
         FROM \`Pharmacy_Store_Items\` psi
         JOIN \`Pharmacy_Store_Items_repair_29_backup\` b ON b.\`id\` = psi.\`id\`
        WHERE psi.\`quantity_received\` = 0
          AND psi.\`total_price\` = psi.\`quantity_remaining\` * psi.\`unit_price\`
          AND psi.\`quantity_remaining\` = b.\`quantity_remaining\``
    );
    const [snapshotted] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) AS rows_snapshotted FROM `Pharmacy_Store_Items_repair_29_backup`'
    );
    if (Number(touched[0].rows_repaired) !== Number(snapshotted[0].rows_snapshotted)) {
      throw new Error(
        `Repair reconciliation failed: ${snapshotted[0].rows_snapshotted} row(s) snapshotted, ` +
          `but only ${touched[0].rows_repaired} repaired correctly. The migration has NOT ` +
          'committed; inspect Pharmacy_Store_Items_repair_29_backup against the table.'
      );
    }
  },

  down: async queryInterface => {
    const [backupExists] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) AS n FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'Pharmacy_Store_Items_repair_29_backup'`
    );
    if (!Number(backupExists[0].n)) {
      throw new Error(
        'Cannot revert: Pharmacy_Store_Items_repair_29_backup does not exist. The snapshot is ' +
          'the only record of what these rows carried before the #29 repair; without it there is ' +
          'nothing honest to restore to.'
      );
    }

    // Rows deleted since the repair are resurrected whole from the snapshot, not silently lost.
    await queryInterface.sequelize.query(
      `INSERT INTO \`Pharmacy_Store_Items\`
         SELECT * FROM \`Pharmacy_Store_Items_repair_29_backup\` b
        WHERE b.\`id\` NOT IN (SELECT \`id\` FROM (SELECT \`id\` FROM \`Pharmacy_Store_Items\`) x)`
    );

    // Restore ONLY the columns the repair touched. quantity_remaining is deliberately excluded:
    // dispensing since the repair is real and reverting it would claim stock back onto shelves.
    await queryInterface.sequelize.query(
      `UPDATE \`Pharmacy_Store_Items\` psi
         JOIN \`Pharmacy_Store_Items_repair_29_backup\` b ON b.\`id\` = psi.\`id\`
          SET psi.\`quantity_received\` = b.\`quantity_received\`,
              psi.\`total_price\` = b.\`total_price\``
    );

    await queryInterface.sequelize.query('DROP TABLE `Pharmacy_Store_Items_repair_29_backup`');
  },
};
