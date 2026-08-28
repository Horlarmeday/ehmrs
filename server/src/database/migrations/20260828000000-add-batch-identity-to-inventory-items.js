'use strict';

/**
 * Batch identity for the dispensary (Accounting issue #295).
 *
 * Inventory_Items loses batch identity at the Store→Inventory transfer: the transfer keys on
 * {drug_id, inventory_id}, so distinct store batches collapse into one row and the merge branch
 * overwrites acquired_price/expiration/brand with the newest transfer's values. This migration
 * adds the identity the fixed transfer key needs:
 *
 *   - Inventory_Items.pharmacy_store_id  nullable FK → Pharmacy_Store_Items.id. The EMR's own
 *     store row PK — deliberately NOT Accounting's external_batch_id (D2 of the plan).
 *   - Inventory_Items.batch              the batch string copied across for operator visibility;
 *     a display copy, never the join key.
 *   - Inventory_Item_Histories.pharmacy_store_id  so every dispense/return/supply row can name
 *     the layer it moved stock from.
 *
 * Nullable PERMANENTLY, not as a staging step (D3): pre-existing rows are the sum of an unknown
 * number of batches and cannot be split retroactively — a null is visibly unknown, a guessed FK
 * is silently wrong. No code path may create a null-pharmacy_store_id layer after this migration;
 * that invariant is enforced in the transfer path and test-guarded.
 *
 * No quantity column is touched. No row's quantity changes as a result of this migration.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Inventory_Items', 'pharmacy_store_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'brand',
    });
    await queryInterface.addColumn('Inventory_Items', 'batch', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'pharmacy_store_id',
    });
    await queryInterface.addColumn('Inventory_Item_Histories', 'pharmacy_store_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'visit_id',
    });

    await queryInterface.addIndex('Inventory_Items', ['pharmacy_store_id'], {
      name: 'idx_inventory_items_pharmacy_store_id',
    });

    // The FK is the point of D2: a local, database-enforceable reference to the EMR's own store
    // row. SET NULL, because deleting a store row must not cascade-delete dispensary stock or
    // block the delete — the layer survives with visibly-unknown provenance instead.
    await queryInterface.addConstraint('Inventory_Items', {
      fields: ['pharmacy_store_id'],
      type: 'foreign key',
      name: 'fk_inventory_items_pharmacy_store',
      references: {
        table: 'Pharmacy_Store_Items',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('Inventory_Item_Histories', {
      fields: ['pharmacy_store_id'],
      type: 'foreign key',
      name: 'fk_inventory_item_histories_pharmacy_store',
      references: {
        table: 'Pharmacy_Store_Items',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  down: async queryInterface => {
    await queryInterface.removeConstraint(
      'Inventory_Item_Histories',
      'fk_inventory_item_histories_pharmacy_store'
    );
    await queryInterface.removeConstraint('Inventory_Items', 'fk_inventory_items_pharmacy_store');
    await queryInterface.removeIndex('Inventory_Items', 'idx_inventory_items_pharmacy_store_id');
    await queryInterface.removeColumn('Inventory_Item_Histories', 'pharmacy_store_id');
    await queryInterface.removeColumn('Inventory_Items', 'batch');
    await queryInterface.removeColumn('Inventory_Items', 'pharmacy_store_id');
  },
};
