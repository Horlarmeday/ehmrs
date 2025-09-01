'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new fields to Journal_Entries table
    await queryInterface.addColumn('Journal_Entries', 'entry_type', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Type of journal entry (e.g., PATIENT_SERVICE, REVERSAL, ADJUSTMENT)',
    });

    await queryInterface.addColumn('Journal_Entries', 'created_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Staff',
        key: 'id',
      },
      comment: 'Staff member who created the entry',
    });

    await queryInterface.addColumn('Journal_Entries', 'approved_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Staff',
        key: 'id',
      },
      comment: 'Staff member who approved the entry',
    });

    await queryInterface.addColumn('Journal_Entries', 'posted_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Staff',
        key: 'id',
      },
      comment: 'Staff member who posted the entry',
    });

    await queryInterface.addColumn('Journal_Entries', 'reversed_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Staff',
        key: 'id',
      },
      comment: 'Staff member who reversed the entry',
    });

    await queryInterface.addColumn('Journal_Entries', 'approved_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when entry was approved',
    });

    await queryInterface.addColumn('Journal_Entries', 'posted_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when entry was posted',
    });

    await queryInterface.addColumn('Journal_Entries', 'reversed_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when entry was reversed',
    });

    await queryInterface.addColumn('Journal_Entries', 'approval_notes', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Notes from approval process',
    });

    await queryInterface.addColumn('Journal_Entries', 'rejection_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Reason for rejection if entry was rejected',
    });

    await queryInterface.addColumn('Journal_Entries', 'reversal_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Reason for reversal',
    });

    await queryInterface.addColumn('Journal_Entries', 'reversed_entry_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Journal_Entries',
        key: 'id',
      },
      comment: 'Reference to the original entry if this is a reversal',
    });

    await queryInterface.addColumn('Journal_Entries', 'unposted_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when entry was unposted',
    });

    await queryInterface.addColumn('Journal_Entries', 'unposted_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Staff',
        key: 'id',
      },
      comment: 'Staff member who unposted the entry',
    });

    await queryInterface.addColumn('Journal_Entries', 'unpost_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Reason for unposting',
    });

    // Add new field to Journal_Entry_Lines table
    await queryInterface.addColumn('Journal_Entry_Lines', 'line_type', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'STANDARD',
      comment: 'Type of journal entry line (e.g., STANDARD, REVERSAL, ADJUSTMENT)',
    });

    // Create indexes for performance
    await queryInterface.addIndex('Journal_Entries', ['entry_type']);
    await queryInterface.addIndex('Journal_Entries', ['created_by']);
    await queryInterface.addIndex('Journal_Entries', ['approved_by']);
    await queryInterface.addIndex('Journal_Entries', ['posted_by']);
    await queryInterface.addIndex('Journal_Entries', ['reversed_by']);
    await queryInterface.addIndex('Journal_Entries', ['reversed_entry_id']);
    await queryInterface.addIndex('Journal_Entries', ['status']);
    await queryInterface.addIndex('Journal_Entry_Lines', ['line_type']);

    console.log('✅ Enhanced journal entry models migration completed');
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes
    await queryInterface.removeIndex('Journal_Entries', ['entry_type']);
    await queryInterface.removeIndex('Journal_Entries', ['created_by']);
    await queryInterface.removeIndex('Journal_Entries', ['approved_by']);
    await queryInterface.removeIndex('Journal_Entries', ['posted_by']);
    await queryInterface.removeIndex('Journal_Entries', ['reversed_by']);
    await queryInterface.removeIndex('Journal_Entries', ['reversed_entry_id']);
    await queryInterface.removeIndex('Journal_Entries', ['status']);
    await queryInterface.removeIndex('Journal_Entry_Lines', ['line_type']);

    // Remove columns from Journal_Entries table
    await queryInterface.removeColumn('Journal_Entries', 'unpost_reason');
    await queryInterface.removeColumn('Journal_Entries', 'unposted_by');
    await queryInterface.removeColumn('Journal_Entries', 'unposted_at');
    await queryInterface.removeColumn('Journal_Entries', 'reversed_entry_id');
    await queryInterface.removeColumn('Journal_Entries', 'reversal_reason');
    await queryInterface.removeColumn('Journal_Entries', 'rejection_reason');
    await queryInterface.removeColumn('Journal_Entries', 'approval_notes');
    await queryInterface.removeColumn('Journal_Entries', 'reversed_at');
    await queryInterface.removeColumn('Journal_Entries', 'posted_at');
    await queryInterface.removeColumn('Journal_Entries', 'approved_at');
    await queryInterface.removeColumn('Journal_Entries', 'reversed_by');
    await queryInterface.removeColumn('Journal_Entries', 'posted_by');
    await queryInterface.removeColumn('Journal_Entries', 'approved_by');
    await queryInterface.removeColumn('Journal_Entries', 'created_by');
    await queryInterface.removeColumn('Journal_Entries', 'entry_type');

    // Remove column from Journal_Entry_Lines table
    await queryInterface.removeColumn('Journal_Entry_Lines', 'line_type');

    console.log('✅ Enhanced journal entry models migration rolled back');
  },
};
