'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Create Cash_Register table
      await queryInterface.createTable('Cash_Register', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        register_code: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        register_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        location: {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Location or department where register is located',
        },
        current_balance: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Current cash balance in register',
        },
        opening_balance: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Opening balance for the day',
        },
        expected_closing_balance: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Expected closing balance for the day',
        },
        actual_closing_balance: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Actual closing balance for the day',
        },
        total_cash_received: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Total cash received today',
        },
        total_cash_disbursed: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Total cash disbursed today',
        },
        total_change_given: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Total change given today',
        },
        total_payments_processed: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Total cash payments processed today',
        },
        transaction_count: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Number of transactions processed today',
        },
        last_opened_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when register was last opened',
        },
        last_closed_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when register was last closed',
        },
        last_reconciled_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when register was last reconciled',
        },
        status: {
          type: Sequelize.ENUM('OPEN', 'CLOSED', 'SUSPENDED', 'MAINTENANCE'),
          allowNull: false,
          defaultValue: 'CLOSED',
          comment: 'Current status of the cash register',
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        is_in_use: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        minimum_balance: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Minimum balance required to keep register open',
        },
        maximum_balance: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Maximum balance allowed in register',
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Additional notes about the register',
        },
        assigned_staff_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Staff',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        opened_by_staff_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Staff',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        closed_by_staff_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Staff',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        reconciled_by_staff_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Staff',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      });

      // Create Cash_Movement table
      await queryInterface.createTable('Cash_Movement', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        register_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Cash_Register',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        movement_type: {
          type: Sequelize.ENUM(
            'CASH_IN',
            'CASH_OUT',
            'PAYMENT_RECEIVED',
            'CHANGE_GIVEN',
            'OPENING_BALANCE',
            'CLOSING_BALANCE',
            'RECONCILIATION',
            'ADJUSTMENT',
            'REFUND',
            'DEPOSIT',
            'WITHDRAWAL',
            'TRANSFER_IN',
            'TRANSFER_OUT'
          ),
          allowNull: false,
          comment: 'Type of cash movement',
        },
        amount: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          comment: 'Amount of cash movement',
        },
        previous_balance: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          comment: 'Balance before movement',
        },
        new_balance: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          comment: 'Balance after movement',
        },
        description: {
          type: Sequelize.STRING,
          allowNull: false,
          comment: 'Description of the movement',
        },
        reference_number: {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Reference number for the movement',
        },
        transaction_reference: {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Related transaction ID or payment reference',
        },
        status: {
          type: Sequelize.ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'),
          allowNull: false,
          defaultValue: 'COMPLETED',
          comment: 'Status of the cash movement',
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Additional notes about the movement',
        },
        processed_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when movement was processed',
        },
        reversed_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when movement was reversed (if applicable)',
        },
        reversal_reason: {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Reason for reversal (if applicable)',
        },
        is_reversed: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Whether this movement has been reversed',
        },
        requires_approval: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Whether this movement requires approval',
        },
        is_approved: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Whether this movement has been approved',
        },
        approved_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when movement was approved',
        },
        approved_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Staff',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        approval_notes: {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Approval notes or comments',
        },
        processed_by: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Staff',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        reversed_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Staff',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      });

      // Create indexes for performance
      await queryInterface.addIndex('Cash_Register', ['register_code']);
      await queryInterface.addIndex('Cash_Register', ['status']);
      await queryInterface.addIndex('Cash_Register', ['assigned_staff_id']);
      await queryInterface.addIndex('Cash_Register', ['is_active']);
      await queryInterface.addIndex('Cash_Register', ['location']);

      await queryInterface.addIndex('Cash_Movement', ['register_id']);
      await queryInterface.addIndex('Cash_Movement', ['movement_type']);
      await queryInterface.addIndex('Cash_Movement', ['processed_by']);
      await queryInterface.addIndex('Cash_Movement', ['status']);
      await queryInterface.addIndex('Cash_Movement', ['processed_at']);
      await queryInterface.addIndex('Cash_Movement', ['transaction_reference']);
      await queryInterface.addIndex('Cash_Movement', ['is_reversed']);

      // Add cash_register_id column to Clinical_Payment table if it doesn't exist
      try {
        await queryInterface.addColumn('Clinical_Payment', 'cash_register_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Cash_Register',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          comment: 'Cash register used for cash payments',
        });
      } catch (error) {
        // Column might already exist, ignore error
        console.log('cash_register_id column might already exist in Clinical_Payment table');
      }

      console.log('✅ Successfully created cash register system tables');
    } catch (error) {
      console.error('❌ Error creating cash register system tables:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove cash_register_id column from Clinical_Payment table
      try {
        await queryInterface.removeColumn('Clinical_Payment', 'cash_register_id');
      } catch (error) {
        // Column might not exist, ignore error
        console.log('cash_register_id column might not exist in Clinical_Payment table');
      }

      // Drop Cash_Movement table
      await queryInterface.dropTable('Cash_Movement');

      // Drop Cash_Register table
      await queryInterface.dropTable('Cash_Register');

      console.log('✅ Successfully reverted cash register system tables');
    } catch (error) {
      console.error('❌ Error reverting cash register system tables:', error);
      throw error;
    }
  },
};
