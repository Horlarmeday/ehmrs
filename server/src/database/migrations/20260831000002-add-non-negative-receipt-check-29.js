'use strict';

/**
 * EMR #29 defect B — the database-level floor on receipt quantities.
 *
 * MUST run AFTER 20260831000001-repair-29-negative-receipt-quantities.js: this constraint cannot
 * apply while the 586 negative rows #29 measured are still negative. The filenames sort in that
 * order; do not renumber.
 *
 * WHY A CHECK WHEN THE MODEL ALREADY VALIDATES (plan D1)
 * -----------------------------------------------------
 * The Sequelize validator on `PharmacyStore.quantity_received` gives the good, readable error —
 * but `Model.update()` skips validators unless passed `validate: true`, and raw queries, imports
 * and future writers never see model validators at all. The CHECK holds regardless of write path.
 * Neither layer alone is sufficient; this is the second brace, not a replacement.
 *
 * MySQL 8.0.16+ enforces CHECK constraints. On 8.0.15 and earlier, and on MariaDB pre-10.2.1,
 * the clause is parsed and ignored — the migration applies "cleanly" while constraining nothing.
 * The rehearsal checks in src/database/scripts/repair-29-negative-receipts.sql include a probe
 * that proves the constraint BITES on the target server before this is relied upon.
 *
 * A named constraint, not an inline one, so `down` can drop it without table surgery.
 */
module.exports = {
  up: async queryInterface => {
    await queryInterface.sequelize.query(
      'ALTER TABLE `Pharmacy_Store_Items` ' +
        'ADD CONSTRAINT `chk_psi_quantity_received_nonnegative` ' +
        'CHECK (`quantity_received` >= 0)'
    );
  },

  down: async queryInterface => {
    await queryInterface.sequelize.query(
      'ALTER TABLE `Pharmacy_Store_Items` ' + 'DROP CHECK `chk_psi_quantity_received_nonnegative`'
    );
  },
};
