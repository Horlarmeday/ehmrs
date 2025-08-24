'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Chart_of_Account', 'tax_code', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'balance'
    });

    await queryInterface.addColumn('Chart_of_Account', 'budget_allocation', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      after: 'tax_code'
    });

    await queryInterface.addColumn('Chart_of_Account', 'allow_manual_entries', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: true,
      after: 'budget_allocation'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Chart_of_Account', 'tax_code');
    await queryInterface.removeColumn('Chart_of_Account', 'budget_allocation');
    await queryInterface.removeColumn('Chart_of_Account', 'allow_manual_entries');
  }
};
