'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add procurement_order_id column
    await queryInterface.addColumn('Pharmacy_Store_Items', 'procurement_order_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Procurement_Orders',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Add index for better performance
    await queryInterface.addIndex('Pharmacy_Store_Items', ['procurement_order_id']);

    // Note: We'll remove the drug_type column in a separate migration after data migration
    // to avoid data loss during the transition
  },

  down: async (queryInterface, Sequelize) => {
    // Remove procurement_order_id column
    await queryInterface.removeColumn('Pharmacy_Store_Items', 'procurement_order_id');

    // Remove index
    await queryInterface.removeIndex('Pharmacy_Store_Items', ['procurement_order_id']);
  },
};
