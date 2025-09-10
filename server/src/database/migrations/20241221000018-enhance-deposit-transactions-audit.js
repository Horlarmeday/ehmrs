'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // This migration is no longer needed since we're using a dedicated DepositAuditLog model
    // The deposit_transactions table should remain focused on financial transactions only
    console.log('Migration skipped: Using dedicated DepositAuditLog model for audit logging');
  },

  async down(queryInterface, Sequelize) {
    // No columns to remove
    console.log('Migration down: No columns to remove');
  },
};
