'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add new columns to pos_terminals table if they don't exist
      const tableInfo = await queryInterface.describeTable('pos_terminals');

      // Add card_type column if it doesn't exist
      if (!tableInfo.card_type) {
        await queryInterface.addColumn('pos_terminals', 'card_type', {
          type: Sequelize.ENUM('VISA', 'MASTERCARD', 'AMEX', 'DISCOVER', 'OTHER'),
          allowNull: true,
          comment: 'Primary card type accepted by this terminal',
        });
      }

      // Add card_last_four column if it doesn't exist
      if (!tableInfo.card_last_four) {
        await queryInterface.addColumn('pos_terminals', 'card_last_four', {
          type: Sequelize.STRING(4),
          allowNull: true,
          comment: 'Last four digits of card for tracking',
        });
      }

      // Add authorization_code column if it doesn't exist
      if (!tableInfo.authorization_code) {
        await queryInterface.addColumn('pos_terminals', 'authorization_code', {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'Authorization code from card processor',
        });
      }

      // Add transaction_id column if it doesn't exist
      if (!tableInfo.transaction_id) {
        await queryInterface.addColumn('pos_terminals', 'transaction_id', {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Transaction ID from card processor',
        });
      }

      // Add settlement_frequency column if it doesn't exist
      if (!tableInfo.settlement_frequency) {
        await queryInterface.addColumn('pos_terminals', 'settlement_frequency', {
          type: Sequelize.ENUM('DAILY', 'WEEKLY', 'MONTHLY'),
          allowNull: false,
          defaultValue: 'DAILY',
          comment: 'How often this terminal should be settled',
        });
      }

      // Add last_settlement_date column if it doesn't exist
      if (!tableInfo.last_settlement_date) {
        await queryInterface.addColumn('pos_terminals', 'last_settlement_date', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when terminal was last settled',
        });
      }

      // Add settlement_status column if it doesn't exist
      if (!tableInfo.settlement_status) {
        await queryInterface.addColumn('pos_terminals', 'settlement_status', {
          type: Sequelize.ENUM('PENDING', 'SETTLED', 'FAILED', 'OVERDUE'),
          allowNull: false,
          defaultValue: 'PENDING',
          comment: 'Current settlement status of the terminal',
        });
      }

      // Add settlement_amount column if it doesn't exist
      if (!tableInfo.settlement_amount) {
        await queryInterface.addColumn('pos_terminals', 'settlement_amount', {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Amount pending settlement',
        });
      }

      // Add settlement_transaction_count column if it doesn't exist
      if (!tableInfo.settlement_transaction_count) {
        await queryInterface.addColumn('pos_terminals', 'settlement_transaction_count', {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Number of transactions pending settlement',
        });
      }

      // Add terminal_status column if it doesn't exist
      if (!tableInfo.terminal_status) {
        await queryInterface.addColumn('pos_terminals', 'terminal_status', {
          type: Sequelize.ENUM('ONLINE', 'OFFLINE', 'MAINTENANCE', 'ERROR'),
          allowNull: false,
          defaultValue: 'ONLINE',
          comment: 'Current operational status of the terminal',
        });
      }

      // Add error_message column if it doesn't exist
      if (!tableInfo.error_message) {
        await queryInterface.addColumn('pos_terminals', 'error_message', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Last error message from the terminal',
        });
      }

      // Add last_error_at column if it doesn't exist
      if (!tableInfo.last_error_at) {
        await queryInterface.addColumn('pos_terminals', 'last_error_at', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'When the last error occurred',
        });
      }

      // Add network_status column if it doesn't exist
      if (!tableInfo.network_status) {
        await queryInterface.addColumn('pos_terminals', 'network_status', {
          type: Sequelize.ENUM('CONNECTED', 'DISCONNECTED', 'SLOW', 'UNSTABLE'),
          allowNull: false,
          defaultValue: 'CONNECTED',
          comment: 'Network connectivity status',
        });
      }

      // Add last_network_check column if it doesn't exist
      if (!tableInfo.last_network_check) {
        await queryInterface.addColumn('pos_terminals', 'last_network_check', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Last network connectivity check',
        });
      }

      // Add firmware_version column if it doesn't exist
      if (!tableInfo.firmware_version) {
        await queryInterface.addColumn('pos_terminals', 'firmware_version', {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'Current firmware version of the terminal',
        });
      }

      // Add software_version column if it doesn't exist
      if (!tableInfo.software_version) {
        await queryInterface.addColumn('pos_terminals', 'software_version', {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'Current software version of the terminal',
        });
      }

      // Add maintenance_schedule column if it doesn't exist
      if (!tableInfo.maintenance_schedule) {
        await queryInterface.addColumn('pos_terminals', 'maintenance_schedule', {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Maintenance schedule for the terminal',
        });
      }

      // Add next_maintenance_date column if it doesn't exist
      if (!tableInfo.next_maintenance_date) {
        await queryInterface.addColumn('pos_terminals', 'next_maintenance_date', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Next scheduled maintenance date',
        });
      }

      // Add warranty_expiry column if it doesn't exist
      if (!tableInfo.warranty_expiry) {
        await queryInterface.addColumn('pos_terminals', 'warranty_expiry', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Warranty expiration date',
        });
      }

      // Add vendor_contact column if it doesn't exist
      if (!tableInfo.vendor_contact) {
        await queryInterface.addColumn('pos_terminals', 'vendor_contact', {
          type: Sequelize.STRING(200),
          allowNull: true,
          comment: 'Vendor contact information',
        });
      }

      // Add support_phone column if it doesn't exist
      if (!tableInfo.support_phone) {
        await queryInterface.addColumn('pos_terminals', 'support_phone', {
          type: Sequelize.STRING(20),
          allowNull: true,
          comment: 'Support phone number for the terminal',
        });
      }

      // Add support_email column if it doesn't exist
      if (!tableInfo.support_email) {
        await queryInterface.addColumn('pos_terminals', 'support_email', {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Support email for the terminal',
        });
      }

      // Add notes column if it doesn't exist
      if (!tableInfo.notes) {
        await queryInterface.addColumn('pos_terminals', 'notes', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Additional notes about the terminal',
        });
      }

      // Create indexes for performance
      try {
        await queryInterface.addIndex('pos_terminals', ['settlement_status']);
        await queryInterface.addIndex('pos_terminals', ['terminal_status']);
        await queryInterface.addIndex('pos_terminals', ['settlement_frequency']);
        await queryInterface.addIndex('pos_terminals', ['last_settlement_date']);
        await queryInterface.addIndex('pos_terminals', ['network_status']);
        await queryInterface.addIndex('pos_terminals', ['is_active']);
      } catch (error) {
        // Indexes might already exist, ignore error
        console.log('Some indexes might already exist for pos_terminals table');
      }

      console.log('✅ Successfully enhanced POS terminal system with additional fields');
    } catch (error) {
      console.error('❌ Error enhancing POS terminal system:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove the added columns
      const columnsToRemove = [
        'card_type',
        'card_last_four',
        'authorization_code',
        'transaction_id',
        'settlement_frequency',
        'last_settlement_date',
        'settlement_status',
        'settlement_amount',
        'settlement_transaction_count',
        'terminal_status',
        'error_message',
        'last_error_at',
        'network_status',
        'last_network_check',
        'firmware_version',
        'software_version',
        'maintenance_schedule',
        'next_maintenance_date',
        'warranty_expiry',
        'vendor_contact',
        'support_phone',
        'support_email',
        'notes',
      ];

      for (const column of columnsToRemove) {
        try {
          await queryInterface.removeColumn('pos_terminals', column);
        } catch (error) {
          // Column might not exist, ignore error
          console.log(`Column ${column} might not exist in pos_terminals table`);
        }
      }

      // Remove the ENUM types
      try {
        await queryInterface.sequelize.query(`
          DROP TYPE IF EXISTS "enum_pos_terminals_card_type"
        `);
        await queryInterface.sequelize.query(`
          DROP TYPE IF EXISTS "enum_pos_terminals_settlement_frequency"
        `);
        await queryInterface.sequelize.query(`
          DROP TYPE IF EXISTS "enum_pos_terminals_settlement_status"
        `);
        await queryInterface.sequelize.query(`
          DROP TYPE IF EXISTS "enum_pos_terminals_terminal_status"
        `);
        await queryInterface.sequelize.query(`
          DROP TYPE IF EXISTS "enum_pos_terminals_network_status"
        `);
      } catch (error) {
        // ENUM types might not exist, ignore error
        console.log('Some ENUM types might not exist for pos_terminals table');
      }

      console.log('✅ Successfully reverted POS terminal system enhancements');
    } catch (error) {
      console.error('❌ Error reverting POS terminal system enhancements:', error);
      throw error;
    }
  },
};
