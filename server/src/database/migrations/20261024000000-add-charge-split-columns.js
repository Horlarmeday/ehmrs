'use strict';

/**
 * #90: Accounting's resolved charge split on every prescribed line (ADR-0096/0097).
 *
 * Eight nullable columns on each of the five billable line tables. They are written ONLY by the
 * reverse inbox applier when a `charge.split.updated` arrives; every create/update path leaves
 * them null. No backfill: this EMR is pre-production and the event has no historical resend.
 *
 * Money is naira DECIMAL(12,2), matching every existing money column; the applier converts the
 * event's integer-kobo strings exactly once.
 */

const TABLES = [
  'Prescribed_Drugs',
  'Additional_item_prescriptions',
  'Prescribed_Tests',
  'Prescribed_Investigations',
  'Prescribed_Services',
];

const SPLIT_COLUMNS = [
  {
    name: 'coverage_outcome',
    type: 'ENUM',
    values: ['capitated', 'ffs_claimable', 'co_pay', 'patient_liable', 'retainership'],
  },
  { name: 'split_amount', type: 'DECIMAL' },
  { name: 'patient_share', type: 'DECIMAL' },
  { name: 'patient_net', type: 'DECIMAL' },
  { name: 'insurer_amount', type: 'DECIMAL' },
  { name: 'insurer_net', type: 'DECIMAL' },
  { name: 'corporate_amount', type: 'DECIMAL' },
  { name: 'corporate_net', type: 'DECIMAL' },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    for (const table of TABLES) {
      for (const column of SPLIT_COLUMNS) {
        await queryInterface.addColumn(table, column.name, {
          type:
            column.type === 'ENUM' ? Sequelize.ENUM(...column.values) : Sequelize.DECIMAL(12, 2),
          allowNull: true,
          after: 'billing_status',
        });
      }
    }
  },

  down: async queryInterface => {
    for (const table of TABLES) {
      for (const column of [...SPLIT_COLUMNS].reverse()) {
        await queryInterface.removeColumn(table, column.name);
      }
    }
  },
};
