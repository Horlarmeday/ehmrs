'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ClinicalPaymentItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      payment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ClinicalPayments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      bill_item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ClinicalBillItems',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      amount_paid: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      payment_status: {
        type: Sequelize.ENUM('PAID', 'PARTIAL', 'PENDING'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      payment_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Percentage of item total that was paid',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes for performance
    await queryInterface.addIndex('ClinicalPaymentItems', ['payment_id']);
    await queryInterface.addIndex('ClinicalPaymentItems', ['bill_item_id']);
    await queryInterface.addIndex('ClinicalPaymentItems', ['payment_id', 'bill_item_id'], {
      unique: true,
      name: 'unique_payment_item',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ClinicalPaymentItems');
  },
};
