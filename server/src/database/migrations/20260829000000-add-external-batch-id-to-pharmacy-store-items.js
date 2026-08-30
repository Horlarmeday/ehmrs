'use strict';

/**
 * Accounting's batch id on the bulk store row (Accounting issue #297, ADR-0040).
 *
 * #295 gave the dispensary its own batch identity: Inventory_Items.pharmacy_store_id → the store
 * row it was transferred from. That is the EMR referencing its OWN identity, and it is only the
 * first hop. This migration adds the second: the store row additionally carries the UUID Accounting
 * minted for the batch on stock.received, so the two identities are joinable in one hop —
 *
 *   Inventory_Items.pharmacy_store_id → Pharmacy_Store_Items.external_batch_id → Accounting's
 *   stock_batch
 *
 * — which is the echo path Accounting #27 needs to assign a cost to a dispense.
 *
 * VARCHAR(36): Accounting mints it from a @PrimaryGeneratedColumn('uuid').
 *
 * NULLABLE, permanently. Store rows exist for stock Accounting never saw — pre-cutover stock,
 * donations, anything received before Accounting was installed — and they can never acquire an id
 * retroactively. As with #295's D3, a null is visibly unknown; a fabricated id is silently wrong.
 *
 * NON-UNIQUE, deliberately, and the reason is not convenience. stock.received is an ADDITIVE event
 * (idempotency-guarded only, never sequence-guarded), and the applier branch that writes this
 * column returns before the inbox's claimSequence staleness guard runs. So a redelivery must be a
 * harmless no-op re-write of the same value rather than a constraint violation that fails the whole
 * instruction. Do not add a unique index here later.
 *
 * No quantity column is touched. No row's quantity changes as a result of this migration.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Pharmacy_Store_Items', 'external_batch_id', {
      type: Sequelize.STRING(36),
      allowNull: true,
      after: 'batch',
    });
    await queryInterface.addIndex('Pharmacy_Store_Items', ['external_batch_id'], {
      name: 'idx_pharmacy_store_items_external_batch_id',
      unique: false,
    });
  },

  down: async queryInterface => {
    await queryInterface.removeIndex(
      'Pharmacy_Store_Items',
      'idx_pharmacy_store_items_external_batch_id'
    );
    await queryInterface.removeColumn('Pharmacy_Store_Items', 'external_batch_id');
  },
};
