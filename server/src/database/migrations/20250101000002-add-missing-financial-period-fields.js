'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add missing columns to financial_periods table
      await queryInterface.addColumn('financial_periods', 'period_type', {
        type: Sequelize.STRING(50),
        allowNull: true,
        after: 'name',
      });

      await queryInterface.addColumn('financial_periods', 'is_current', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        after: 'notes',
      });

      await queryInterface.addColumn('financial_periods', 'closing_balance', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        after: 'balance',
      });

      await queryInterface.addColumn('financial_periods', 'auto_close', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        after: 'closing_balance',
      });

      // Update existing records to have default values
      await queryInterface.sequelize.query(`
        UPDATE financial_periods 
        SET 
          period_type = 'YEARLY',
          is_current = false,
          closing_balance = 0,
          auto_close = false
        WHERE period_type IS NULL
      `);

      console.log('✅ Successfully added missing fields to financial_periods table');
    } catch (error) {
      console.error('❌ Error adding missing fields to financial_periods table:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove the added columns
      await queryInterface.removeColumn('financial_periods', 'period_type');
      await queryInterface.removeColumn('financial_periods', 'is_current');
      await queryInterface.removeColumn('financial_periods', 'closing_balance');
      await queryInterface.removeColumn('financial_periods', 'auto_close');

      console.log('✅ Successfully removed missing fields from financial_periods table');
    } catch (error) {
      console.error('❌ Error removing missing fields from financial_periods table:', error);
      throw error;
    }
  },
};
