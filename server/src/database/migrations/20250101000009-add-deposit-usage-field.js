'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('clinical_payments', 'deposit_usage', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Amount used from patient deposit for this payment',
      after: 'deposit_id',
    });

    // Add index for better query performance
    await queryInterface.addIndex('clinical_payments', ['deposit_usage'], {
      name: 'idx_clinical_payments_deposit_usage',
    });

    // Add index for deposit-related queries
    await queryInterface.addIndex('clinical_payments', ['deposit_id', 'deposit_usage'], {
      name: 'idx_clinical_payments_deposit_composite',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes first
    await queryInterface.removeIndex(
      'clinical_payments',
      'idx_clinical_payments_deposit_composite'
    );
    await queryInterface.removeIndex('clinical_payments', 'idx_clinical_payments_deposit_usage');

    // Remove the column
    await queryInterface.removeColumn('clinical_payments', 'deposit_usage');
  },
};
