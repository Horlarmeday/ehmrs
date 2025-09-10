'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create deposit_transactions table
    await queryInterface.createTable('deposit_transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      deposit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'patient_deposits',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      transaction_type: {
        type: Sequelize.ENUM('CREATED', 'USED', 'REFUNDED', 'ADJUSTED', 'EXPIRED'),
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      previous_balance: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      new_balance: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      reference_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      bill_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'clinical_bills',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      journal_entry_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'journal_entries',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'staff',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
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
    await queryInterface.addIndex('deposit_transactions', ['deposit_id']);
    await queryInterface.addIndex('deposit_transactions', ['transaction_type']);
    await queryInterface.addIndex('deposit_transactions', ['reference_number']);
    await queryInterface.addIndex('deposit_transactions', ['bill_id']);
    await queryInterface.addIndex('deposit_transactions', ['journal_entry_id']);
    await queryInterface.addIndex('deposit_transactions', ['created_by']);
    await queryInterface.addIndex('deposit_transactions', ['created_at']);

    // Add composite indexes for common queries
    await queryInterface.addIndex('deposit_transactions', ['deposit_id', 'transaction_type']);
    await queryInterface.addIndex('deposit_transactions', ['deposit_id', 'created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes
    await queryInterface.removeIndex('deposit_transactions', ['deposit_id', 'created_at']);
    await queryInterface.removeIndex('deposit_transactions', ['deposit_id', 'transaction_type']);
    await queryInterface.removeIndex('deposit_transactions', ['created_at']);
    await queryInterface.removeIndex('deposit_transactions', ['created_by']);
    await queryInterface.removeIndex('deposit_transactions', ['journal_entry_id']);
    await queryInterface.removeIndex('deposit_transactions', ['bill_id']);
    await queryInterface.removeIndex('deposit_transactions', ['reference_number']);
    await queryInterface.removeIndex('deposit_transactions', ['transaction_type']);
    await queryInterface.removeIndex('deposit_transactions', ['deposit_id']);

    // Drop table
    await queryInterface.dropTable('deposit_transactions');
  },
};
