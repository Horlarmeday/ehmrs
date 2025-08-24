'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create deposit_journal_entries table
    await queryInterface.createTable('deposit_journal_entries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      deposit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'patient_deposits',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      journal_entry_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'journal_entries',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      entry_type: {
        type: Sequelize.ENUM('DEPOSIT', 'USAGE', 'REFUND', 'ADJUSTMENT'),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('deposit_journal_entries', ['deposit_id']);
    await queryInterface.addIndex('deposit_journal_entries', ['journal_entry_id']);
    await queryInterface.addIndex('deposit_journal_entries', ['entry_type']);
    await queryInterface.addIndex('deposit_journal_entries', ['created_at']);
    
    // Add composite indexes for common queries
    await queryInterface.addIndex('deposit_journal_entries', ['deposit_id', 'entry_type']);
    await queryInterface.addIndex('deposit_journal_entries', ['deposit_id', 'journal_entry_id']);
    await queryInterface.addIndex('deposit_journal_entries', ['journal_entry_id', 'entry_type']);

    // Add unique constraint to prevent duplicate mappings
    await queryInterface.addIndex('deposit_journal_entries', ['deposit_id', 'journal_entry_id'], {
      unique: true,
      name: 'unique_deposit_journal_entry'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes
    await queryInterface.removeIndex('deposit_journal_entries', 'unique_deposit_journal_entry');
    await queryInterface.removeIndex('deposit_journal_entries', ['journal_entry_id', 'entry_type']);
    await queryInterface.removeIndex('deposit_journal_entries', ['deposit_id', 'journal_entry_id']);
    await queryInterface.removeIndex('deposit_journal_entries', ['deposit_id', 'entry_type']);
    await queryInterface.removeIndex('deposit_journal_entries', ['created_at']);
    await queryInterface.removeIndex('deposit_journal_entries', ['entry_type']);
    await queryInterface.removeIndex('deposit_journal_entries', ['journal_entry_id']);
    await queryInterface.removeIndex('deposit_journal_entries', ['deposit_id']);

    // Drop table
    await queryInterface.dropTable('deposit_journal_entries');
  }
};
