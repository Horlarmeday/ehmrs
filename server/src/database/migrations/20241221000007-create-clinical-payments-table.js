'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('clinical_payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      payment_reference: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      bill_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'clinical_bills',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'patients',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_method: {
        type: Sequelize.ENUM(
          'CASH',
          'BANK_TRANSFER',
          'CARD',
          'MOBILE_MONEY',
          'DEPOSIT',
          'INSURANCE',
          'OTHER'
        ),
        allowNull: false,
      },
      payment_type: {
        type: Sequelize.ENUM('FULL', 'PARTIAL', 'DEPOSIT', 'REFUND'),
        allowNull: false,
      },
      transaction_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      bank_reference: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      card_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      mobile_money_provider: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      deposit_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'patient_deposits',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      insurance_provider: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      insurance_claim_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      processed_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'staff',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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

    // Add indexes
    await queryInterface.addIndex('clinical_payments', ['payment_reference'], { unique: true });
    await queryInterface.addIndex('clinical_payments', ['bill_id']);
    await queryInterface.addIndex('clinical_payments', ['patient_id']);
    await queryInterface.addIndex('clinical_payments', ['payment_method']);
    await queryInterface.addIndex('clinical_payments', ['payment_type']);
    await queryInterface.addIndex('clinical_payments', ['status']);
    await queryInterface.addIndex('clinical_payments', ['processed_at']);
    await queryInterface.addIndex('clinical_payments', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('clinical_payments');
  },
};
