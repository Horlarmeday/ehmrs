'use strict';

/**
 * Accounting's batch id on the DELIVERY, and a nullable selling price (Accounting #304, ADR-0041).
 *
 * REVISED IN PLACE rather than superseded. The original version of this migration put
 * `external_batch_id` on `Pharmacy_Store_Items`. It has never run on `ehmrs_prod` — its
 * `information_schema` shows no such column, and `SequelizeMeta` records no 2026 migration — so
 * there is no deployed state to migrate away from, and a follow-up migration would only add a
 * column to production and immediately drop it. It HAS run on `ehmrs_test`, which
 * `setup-test-db.js` provisions by applying every migration sorted after the `schema.sql`
 * snapshot; that database must be rebuilt (`yarn test:db:setup`) for this revision to take effect.
 *
 * WHY THE COLUMN MOVED TO Pharmacy_Store_Histories
 * ------------------------------------------------
 * A `Pharmacy_Store_Items` row is not a batch. It is a per-(drug, drug_type) BIN reused for the
 * lifetime of the drug: `reorderPharmacyItems` (store.repository.ts) spreads `...item` over the
 * existing row on every restock, overwriting `quantity_received`, `unit_price`, `batch` and
 * `expiration` while `quantity_remaining` accumulates. A batch id stored there would name only the
 * MOST RECENT delivery and be silently overwritten by the next one, so Accounting #27 would cost a
 * dispense against whichever layer happened to arrive last. Under FIFO that is a direct COGS
 * misstatement.
 *
 * `Pharmacy_Store_Histories` already holds one row per delivery (`history_type = 'Supplied'`),
 * which is exactly the grain a batch identity needs. Since #304 C0 the create path writes an
 * opening SUPPLIED row too, so a drug's FIRST delivery has somewhere to hang its id — before that
 * change only restocks did, and production carried 40 SUPPLIED rows against 1,664 store rows.
 *
 * The join Accounting #27 needs becomes one hop longer, and faithful for every delivery:
 *
 *   Inventory_Items.pharmacy_store_id → Pharmacy_Store_Items.id
 *     → Pharmacy_Store_Histories.pharmacy_store_id (SUPPLIED) → external_batch_id
 *       → Accounting's stock_batch
 *
 * VARCHAR(36): Accounting mints it from a @PrimaryGeneratedColumn('uuid').
 *
 * NULLABLE, permanently. Deliveries exist that Accounting never saw — pre-cutover stock, donations,
 * samples — and they can never acquire an id retroactively. Per ADR-0041 a NULL is not a failed
 * match; it positively asserts that the stock did not come through procurement. As with #295's D3,
 * a null is visibly unknown while a fabricated id is silently wrong.
 *
 * NON-UNIQUE, deliberately, and the reason is not convenience. `stock.received` is an ADDITIVE
 * event (idempotency-guarded only, never sequence-guarded), and the applier branch that writes this
 * column returns before the inbox's claimSequence staleness guard runs. A redelivery must be a
 * harmless no-op re-write of the same value rather than a constraint violation failing the whole
 * instruction. Do not add a unique index here later.
 *
 * WHY selling_price BECOMES NULLABLE
 * ----------------------------------
 * ADR-0041 makes Accounting the originator of a purchased goods receipt, which creates the EMR's
 * store row from `stock.received`. The event may carry a selling price — the clerk enters it once,
 * on the Accounting receipt screen — but is not required to. Where it does not, the row is born
 * UNPRICED rather than priced at a fabricated number: inventing a patient-facing price is exactly
 * the silently-wrong failure ADR-0001 and ADR-0009 exist to prevent.
 *
 * An unpriced row is NOT DISPENSABLE — `dispenseValidations` refuses it (#304 C5). A drug released
 * at an unknown price is an unbillable charge with the stock already gone.
 *
 * `unit_price` and `total_price` stay NOT NULL: acquisition cost is Accounting's and is always
 * known at receipt (it is what posts Dr Inventory / Cr AP), so a row created from `stock.received`
 * always has one. Only the patient-facing price can legitimately be pending.
 *
 * WHY Inventory_Items ALSO GAINS THE COLUMN
 * -----------------------------------------
 * Moving batch identity to the delivery breaks the `stock.returned` emitters (#297, #298), which
 * asked the BIN which batch was coming back. A bin now has several deliveries — 40 SUPPLIED rows
 * across 16 bins on `ehmrs_prod`, ~2.5 each — and the units on the shelf are commingled, so the bin
 * can no longer answer.
 *
 * The dispensary layer can. A transfer draws from ONE store row and already copies its `batch`,
 * `expiration`, `acquired_price` and `drug_type` onto the layer (`mapInventoryItem`); the batch id
 * rides along the same way. A return then names the delivery the units were actually dispensed
 * from, rather than guessing among the bin's deliveries or emitting nothing.
 *
 * Nullable for the same reasons as above, plus #295's D3: a legacy layer has no `pharmacy_store_id`
 * and so no delivery to inherit an id from.
 *
 * NO BACKFILL. No existing row's price, quantity or batch id is read or written by this migration.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Pharmacy_Store_Histories', 'external_batch_id', {
      type: Sequelize.STRING(36),
      allowNull: true,
    });
    await queryInterface.addIndex('Pharmacy_Store_Histories', ['external_batch_id'], {
      name: 'idx_pharmacy_store_histories_external_batch_id',
      unique: false,
    });

    await queryInterface.addColumn('Inventory_Items', 'external_batch_id', {
      type: Sequelize.STRING(36),
      allowNull: true,
    });
    await queryInterface.addIndex('Inventory_Items', ['external_batch_id'], {
      name: 'idx_inventory_items_external_batch_id',
      unique: false,
    });

    await queryInterface.changeColumn('Pharmacy_Store_Items', 'selling_price', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Restoring NOT NULL would require inventing a price for every unpriced row, which is the one
    // thing this design refuses to do. Fail loudly instead, naming the remedy.
    const [unpriced] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) AS count FROM `Pharmacy_Store_Items` WHERE `selling_price` IS NULL'
    );
    const unpricedCount = Number(unpriced[0].count);
    if (unpricedCount > 0) {
      throw new Error(
        `Cannot revert: ${unpricedCount} Pharmacy_Store_Items row(s) have a NULL selling_price. ` +
          'Restoring the NOT NULL constraint would mean inventing a patient-facing price for each. ' +
          'Price them through the store screen first, then re-run this down migration.'
      );
    }

    await queryInterface.changeColumn('Pharmacy_Store_Items', 'selling_price', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    });

    await queryInterface.removeIndex('Inventory_Items', 'idx_inventory_items_external_batch_id');
    await queryInterface.removeColumn('Inventory_Items', 'external_batch_id');

    await queryInterface.removeIndex(
      'Pharmacy_Store_Histories',
      'idx_pharmacy_store_histories_external_batch_id'
    );
    await queryInterface.removeColumn('Pharmacy_Store_Histories', 'external_batch_id');
  },
};
