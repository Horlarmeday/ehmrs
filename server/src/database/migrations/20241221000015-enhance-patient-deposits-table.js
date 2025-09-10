'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to patient_deposits table
    await queryInterface.addColumn('patient_deposits', 'bank_account_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'bank_accounts',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('patient_deposits', 'initial_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('patient_deposits', 'current_balance', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('patient_deposits', 'refundable_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('patient_deposits', 'deposit_date', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });

    await queryInterface.addColumn('patient_deposits', 'last_activity_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('patient_deposits', 'payment_method', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await queryInterface.addColumn('patient_deposits', 'payment_reference', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    // Update existing records to set initial values
    await queryInterface.sequelize.query(`
      UPDATE patient_deposits 
      SET 
        initial_amount = amount,
        current_balance = amount,
        refundable_amount = amount,
        deposit_date = created_at,
        last_activity_date = updated_at
      WHERE initial_amount IS NULL
    `);

    // Add indexes for new columns
    await queryInterface.addIndex('patient_deposits', ['bank_account_id']);
    await queryInterface.addIndex('patient_deposits', ['deposit_date']);
    await queryInterface.addIndex('patient_deposits', ['last_activity_date']);
    await queryInterface.addIndex('patient_deposits', ['payment_method']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes
    await queryInterface.removeIndex('patient_deposits', ['bank_account_id']);
    await queryInterface.removeIndex('patient_deposits', ['deposit_date']);
    await queryInterface.removeIndex('patient_deposits', ['last_activity_date']);
    await queryInterface.removeIndex('patient_deposits', ['payment_method']);

    // Remove columns
    await queryInterface.removeColumn('patient_deposits', 'payment_reference');
    await queryInterface.removeColumn('patient_deposits', 'payment_method');
    await queryInterface.removeColumn('patient_deposits', 'last_activity_date');
    await queryInterface.removeColumn('patient_deposits', 'deposit_date');
    await queryInterface.removeColumn('patient_deposits', 'refundable_amount');
    await queryInterface.removeColumn('patient_deposits', 'current_balance');
    await queryInterface.removeColumn('patient_deposits', 'initial_amount');
    await queryInterface.removeColumn('patient_deposits', 'bank_account_id');
  },
};
