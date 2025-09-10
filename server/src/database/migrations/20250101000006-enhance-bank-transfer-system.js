'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add new columns to Clinical_Payment table for bank transfer tracking
      const tableInfo = await queryInterface.describeTable('Clinical_Payment');

      // Add transfer_date column if it doesn't exist
      if (!tableInfo.transfer_date) {
        await queryInterface.addColumn('Clinical_Payment', 'transfer_date', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when bank transfer was initiated',
        });
      }

      // Add expected_settlement_date column if it doesn't exist
      if (!tableInfo.expected_settlement_date) {
        await queryInterface.addColumn('Clinical_Payment', 'expected_settlement_date', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Expected date when bank transfer will be settled',
        });
      }

      // Add transfer_fee column if it doesn't exist
      if (!tableInfo.transfer_fee) {
        await queryInterface.addColumn('Clinical_Payment', 'transfer_fee', {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Bank transfer fee amount',
        });
      }

      // Add confirmed_at column if it doesn't exist
      if (!tableInfo.confirmed_at) {
        await queryInterface.addColumn('Clinical_Payment', 'confirmed_at', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when bank transfer was confirmed',
        });
      }

      // Add confirmed_by column if it doesn't exist
      if (!tableInfo.confirmed_by) {
        await queryInterface.addColumn('Clinical_Payment', 'confirmed_by', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Staff',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          comment: 'Staff member who confirmed the bank transfer',
        });
      }

      // Add settled_at column if it doesn't exist
      if (!tableInfo.settled_at) {
        await queryInterface.addColumn('Clinical_Payment', 'settled_at', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when bank transfer was settled',
        });
      }

      // Add settled_by column if it doesn't exist
      if (!tableInfo.settled_by) {
        await queryInterface.addColumn('Clinical_Payment', 'settled_by', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Staff',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          comment: 'Staff member who settled the bank transfer',
        });
      }

      // Add settlement_reference column if it doesn't exist
      if (!tableInfo.settlement_reference) {
        await queryInterface.addColumn('Clinical_Payment', 'settlement_reference', {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Reference number for bank transfer settlement',
        });
      }

      // Add bank_statement_reference column if it doesn't exist
      if (!tableInfo.bank_statement_reference) {
        await queryInterface.addColumn('Clinical_Payment', 'bank_statement_reference', {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Reference from bank statement for reconciliation',
        });
      }

      // Add confirmation_reference column if it doesn't exist
      if (!tableInfo.confirmation_reference) {
        await queryInterface.addColumn('Clinical_Payment', 'confirmation_reference', {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Reference number for bank transfer confirmation',
        });
      }

      // Add transfer_status column if it doesn't exist
      if (!tableInfo.transfer_status) {
        await queryInterface.addColumn('Clinical_Payment', 'transfer_status', {
          type: Sequelize.ENUM('PENDING', 'CONFIRMED', 'SETTLED', 'FAILED', 'CANCELLED'),
          allowNull: false,
          defaultValue: 'PENDING',
          comment: 'Current status of the bank transfer',
        });
      }

      // Add transfer_notes column if it doesn't exist
      if (!tableInfo.transfer_notes) {
        await queryInterface.addColumn('Clinical_Payment', 'transfer_notes', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Additional notes specific to bank transfer',
        });
      }

      // Add transfer_attempts column if it doesn't exist
      if (!tableInfo.transfer_attempts) {
        await queryInterface.addColumn('Clinical_Payment', 'transfer_attempts', {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Number of attempts to process this transfer',
        });
      }

      // Add last_transfer_attempt column if it doesn't exist
      if (!tableInfo.last_transfer_attempt) {
        await queryInterface.addColumn('Clinical_Payment', 'last_transfer_attempt', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date of last transfer attempt',
        });
      }

      // Add transfer_error_message column if it doesn't exist
      if (!tableInfo.transfer_error_message) {
        await queryInterface.addColumn('Clinical_Payment', 'transfer_error_message', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Error message from last transfer attempt',
        });
      }

      // Add transfer_processor column if it doesn't exist
      if (!tableInfo.transfer_processor) {
        await queryInterface.addColumn('Clinical_Payment', 'transfer_processor', {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Bank or payment processor used for transfer',
        });
      }

      // Add transfer_processor_reference column if it doesn't exist
      if (!tableInfo.transfer_processor_reference) {
        await queryInterface.addColumn('Clinical_Payment', 'transfer_processor_reference', {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Reference number from transfer processor',
        });
      }

      // Add transfer_currency column if it doesn't exist
      if (!tableInfo.transfer_currency) {
        await queryInterface.addColumn('Clinical_Payment', 'transfer_currency', {
          type: Sequelize.STRING(3),
          allowNull: false,
          defaultValue: 'NGN',
          comment: 'Currency of the bank transfer',
        });
      }

      // Add exchange_rate column if it doesn't exist
      if (!tableInfo.exchange_rate) {
        await queryInterface.addColumn('Clinical_Payment', 'exchange_rate', {
          type: Sequelize.DECIMAL(10, 6),
          allowNull: false,
          defaultValue: 1.0,
          comment: 'Exchange rate if transfer is in different currency',
        });
      }

      // Add original_amount column if it doesn't exist
      if (!tableInfo.original_amount) {
        await queryInterface.addColumn('Clinical_Payment', 'original_amount', {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: true,
          comment: 'Original amount in transfer currency',
        });
      }

      // Add original_currency column if it doesn't exist
      if (!tableInfo.original_currency) {
        await queryInterface.addColumn('Clinical_Payment', 'original_currency', {
          type: Sequelize.STRING(3),
          allowNull: true,
          comment: 'Original currency of the transfer',
        });
      }

      // Create indexes for performance
      try {
        await queryInterface.addIndex('Clinical_Payment', ['transfer_date']);
        await queryInterface.addIndex('Clinical_Payment', ['expected_settlement_date']);
        await queryInterface.addIndex('Clinical_Payment', ['transfer_status']);
        await queryInterface.addIndex('Clinical_Payment', ['confirmed_at']);
        await queryInterface.addIndex('Clinical_Payment', ['settled_at']);
        await queryInterface.addIndex('Clinical_Payment', ['settlement_reference']);
        await queryInterface.addIndex('Clinical_Payment', ['bank_statement_reference']);
        await queryInterface.addIndex('Clinical_Payment', ['confirmation_reference']);
        await queryInterface.addIndex('Clinical_Payment', ['transfer_processor']);
        await queryInterface.addIndex('Clinical_Payment', ['transfer_processor_reference']);
      } catch (error) {
        // Indexes might already exist, ignore error
        console.log('Some indexes might already exist for Clinical_Payment table');
      }

      console.log('✅ Successfully enhanced Clinical_Payment table with bank transfer fields');
    } catch (error) {
      console.error('❌ Error enhancing Clinical_Payment table:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove the added columns
      const columnsToRemove = [
        'transfer_date',
        'expected_settlement_date',
        'transfer_fee',
        'confirmed_at',
        'confirmed_by',
        'settled_at',
        'settled_by',
        'settlement_reference',
        'bank_statement_reference',
        'confirmation_reference',
        'transfer_status',
        'transfer_notes',
        'transfer_attempts',
        'last_transfer_attempt',
        'transfer_error_message',
        'transfer_processor',
        'transfer_processor_reference',
        'transfer_currency',
        'exchange_rate',
        'original_amount',
        'original_currency',
      ];

      for (const column of columnsToRemove) {
        try {
          await queryInterface.removeColumn('Clinical_Payment', column);
        } catch (error) {
          // Column might not exist, ignore error
          console.log(`Column ${column} might not exist in Clinical_Payment table`);
        }
      }

      // Remove the ENUM type
      try {
        await queryInterface.sequelize.query(`
          DROP TYPE IF EXISTS "enum_Clinical_Payment_transfer_status"
        `);
      } catch (error) {
        // ENUM type might not exist, ignore error
        console.log('ENUM type might not exist for Clinical_Payment table');
      }

      console.log('✅ Successfully reverted Clinical_Payment table enhancements');
    } catch (error) {
      console.error('❌ Error reverting Clinical_Payment table enhancements:', error);
      throw error;
    }
  },
};
