'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add payment collection fields to clinical_bills table
    await queryInterface.addColumn('clinical_bills', 'payment_collection_method', {
      type: Sequelize.ENUM('DEPOSIT', 'POINT_OF_SERVICE', 'INSURANCE_CLAIM', 'MIXED'),
      allowNull: false,
      defaultValue: 'POINT_OF_SERVICE',
    });

    await queryInterface.addColumn('clinical_bills', 'payment_collection_point', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    // Add collection point field to clinical_payments table
    await queryInterface.addColumn('clinical_payments', 'collection_point', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    // Update payment_type enum to include POINT_OF_SERVICE
    // Note: MySQL doesn't support adding values to existing ENUMs easily
    // We'll need to recreate the table or use a different approach
    // For now, we'll add the column and handle the enum update separately

    // Add indexes for better performance
    await queryInterface.addIndex('clinical_bills', ['payment_collection_method']);
    await queryInterface.addIndex('clinical_bills', ['payment_collection_point']);
    await queryInterface.addIndex('clinical_payments', ['collection_point']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove payment collection fields from clinical_bills table
    await queryInterface.removeColumn('clinical_bills', 'payment_collection_method');
    await queryInterface.removeColumn('clinical_bills', 'payment_collection_point');

    // Remove collection point field from clinical_payments table
    await queryInterface.removeColumn('clinical_payments', 'collection_point');
  },
};
