'use strict';

/**
 * #109: indexes for Accounting's reconciliation reads (ehmrs_accounting#747). The reads select by
 * creation time and by batch id, and the outbox grows with every event.
 */

const INDEXES = [
  { table: 'Prescribed_Drugs', fields: ['createdAt'] },
  { table: 'Prescribed_Tests', fields: ['createdAt'] },
  { table: 'Prescribed_Services', fields: ['createdAt'] },
  { table: 'Prescribed_Investigations', fields: ['createdAt'] },
  { table: 'Additional_item_prescriptions', fields: ['createdAt'] },
  { table: 'Inventory_Item_Histories', fields: ['createdAt'] },
  { table: 'Pharmacy_Store_Histories', fields: ['external_batch_id'] },
  { table: 'Outbox_Events', fields: ['event_type', 'aggregate_id'] },
  { table: 'Outbox_Events', fields: ['sent_at', 'attempts'] },
];

const indexName = ({ table, fields }) => `idx_recon_${table.toLowerCase()}_${fields.join('_')}`;

module.exports = {
  up: async queryInterface => {
    for (const index of INDEXES) {
      await queryInterface.addIndex(index.table, index.fields, { name: indexName(index) });
    }
  },

  down: async queryInterface => {
    for (const index of INDEXES) {
      await queryInterface.removeIndex(index.table, indexName(index));
    }
  },
};
