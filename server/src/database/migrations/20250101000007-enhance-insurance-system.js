'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add new columns to Clinical_Payment table for insurance tracking
      const tableInfo = await queryInterface.describeTable('Clinical_Payment');

      // Add claim_reference column if it doesn't exist
      if (!tableInfo.claim_reference) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_reference', {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Reference number for insurance claim',
        });
      }

      // Add claim_date column if it doesn't exist
      if (!tableInfo.claim_date) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_date', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when insurance claim was submitted',
        });
      }

      // Add claim_status column if it doesn't exist
      if (!tableInfo.claim_status) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_status', {
          type: Sequelize.ENUM(
            'PENDING',
            'SUBMITTED',
            'APPROVED',
            'REJECTED',
            'PAID',
            'PARTIALLY_PAID'
          ),
          allowNull: false,
          defaultValue: 'PENDING',
          comment: 'Current status of the insurance claim',
        });
      }

      // Add claim_notes column if it doesn't exist
      if (!tableInfo.claim_notes) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_notes', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Additional notes specific to insurance claim',
        });
      }

      // Add claim_submitted_at column if it doesn't exist
      if (!tableInfo.claim_submitted_at) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_submitted_at', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when claim was submitted to insurance',
        });
      }

      // Add claim_submitted_by column if it doesn't exist
      if (!tableInfo.claim_submitted_by) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_submitted_by', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Staff',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          comment: 'Staff member who submitted the claim',
        });
      }

      // Add claim_approved_at column if it doesn't exist
      if (!tableInfo.claim_approved_at) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_approved_at', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when claim was approved by insurance',
        });
      }

      // Add claim_approved_by column if it doesn't exist
      if (!tableInfo.claim_approved_by) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_approved_by', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Staff',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          comment: 'Staff member who approved the claim',
        });
      }

      // Add claim_rejected_at column if it doesn't exist
      if (!tableInfo.claim_rejected_at) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_rejected_at', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when claim was rejected by insurance',
        });
      }

      // Add claim_rejection_reason column if it doesn't exist
      if (!tableInfo.claim_rejection_reason) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_rejection_reason', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Reason for claim rejection',
        });
      }

      // Add claim_approved_amount column if it doesn't exist
      if (!tableInfo.claim_approved_amount) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_approved_amount', {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: true,
          comment: 'Amount approved by insurance',
        });
      }

      // Add claim_partial_approval_reason column if it doesn't exist
      if (!tableInfo.claim_partial_approval_reason) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_partial_approval_reason', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Reason for partial approval',
        });
      }

      // Add claim_settlement_method column if it doesn't exist
      if (!tableInfo.claim_settlement_method) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_settlement_method', {
          type: Sequelize.ENUM('BANK_TRANSFER', 'CHECK', 'CASH', 'ELECTRONIC'),
          allowNull: true,
          comment: 'Method used for claim settlement',
        });
      }

      // Add claim_settlement_reference column if it doesn't exist
      if (!tableInfo.claim_settlement_reference) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_settlement_reference', {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Reference number for claim settlement',
        });
      }

      // Add claim_settlement_date column if it doesn't exist
      if (!tableInfo.claim_settlement_date) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_settlement_date', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when claim was settled',
        });
      }

      // Add claim_settled_by column if it doesn't exist
      if (!tableInfo.claim_settled_by) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_settled_by', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Staff',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          comment: 'Staff member who settled the claim',
        });
      }

      // Add claim_settlement_notes column if it doesn't exist
      if (!tableInfo.claim_settlement_notes) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_settlement_notes', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Notes about claim settlement',
        });
      }

      // Add claim_processing_fee column if it doesn't exist
      if (!tableInfo.claim_processing_fee) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_processing_fee', {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Processing fee for insurance claim',
        });
      }

      // Add claim_administrative_fee column if it doesn't exist
      if (!tableInfo.claim_administrative_fee) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_administrative_fee', {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Administrative fee for insurance claim',
        });
      }

      // Add claim_deductible_amount column if it doesn't exist
      if (!tableInfo.claim_deductible_amount) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_deductible_amount', {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Deductible amount for insurance claim',
        });
      }

      // Add claim_coinsurance_percentage column if it doesn't exist
      if (!tableInfo.claim_coinsurance_percentage) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_coinsurance_percentage', {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Coinsurance percentage for insurance claim',
        });
      }

      // Add claim_out_of_pocket_maximum column if it doesn't exist
      if (!tableInfo.claim_out_of_pocket_maximum) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_out_of_pocket_maximum', {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: true,
          comment: 'Out of pocket maximum for insurance claim',
        });
      }

      // Add claim_benefit_period_start column if it doesn't exist
      if (!tableInfo.claim_benefit_period_start) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_benefit_period_start', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Start date of benefit period',
        });
      }

      // Add claim_benefit_period_end column if it doesn't exist
      if (!tableInfo.claim_benefit_period_end) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_benefit_period_end', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'End date of benefit period',
        });
      }

      // Add claim_network_status column if it doesn't exist
      if (!tableInfo.claim_network_status) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_network_status', {
          type: Sequelize.ENUM('IN_NETWORK', 'OUT_OF_NETWORK', 'UNKNOWN'),
          allowNull: false,
          defaultValue: 'UNKNOWN',
          comment: 'Network status for insurance claim',
        });
      }

      // Add claim_prior_authorization column if it doesn't exist
      if (!tableInfo.claim_prior_authorization) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_prior_authorization', {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Prior authorization number for claim',
        });
      }

      // Add claim_prior_authorization_date column if it doesn't exist
      if (!tableInfo.claim_prior_authorization_date) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_prior_authorization_date', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date of prior authorization',
        });
      }

      // Add claim_denial_code column if it doesn't exist
      if (!tableInfo.claim_denial_code) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_denial_code', {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'Denial code if claim is rejected',
        });
      }

      // Add claim_denial_description column if it doesn't exist
      if (!tableInfo.claim_denial_description) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_denial_description', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Description of denial reason',
        });
      }

      // Add claim_appeal_deadline column if it doesn't exist
      if (!tableInfo.claim_appeal_deadline) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_appeal_deadline', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Deadline for filing appeal',
        });
      }

      // Add claim_appeal_status column if it doesn't exist
      if (!tableInfo.claim_appeal_status) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_appeal_status', {
          type: Sequelize.ENUM('NOT_APPEALED', 'APPEALED', 'APPEAL_APPROVED', 'APPEAL_REJECTED'),
          allowNull: false,
          defaultValue: 'NOT_APPEALED',
          comment: 'Status of claim appeal',
        });
      }

      // Add claim_appeal_date column if it doesn't exist
      if (!tableInfo.claim_appeal_date) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_appeal_date', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when appeal was filed',
        });
      }

      // Add claim_appeal_notes column if it doesn't exist
      if (!tableInfo.claim_appeal_notes) {
        await queryInterface.addColumn('Clinical_Payment', 'claim_appeal_notes', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Notes about claim appeal',
        });
      }

      // Create indexes for performance
      try {
        await queryInterface.addIndex('Clinical_Payment', ['claim_reference']);
        await queryInterface.addIndex('Clinical_Payment', ['claim_status']);
        await queryInterface.addIndex('Clinical_Payment', ['claim_date']);
        await queryInterface.addIndex('Clinical_Payment', ['claim_submitted_at']);
        await queryInterface.addIndex('Clinical_Payment', ['claim_approved_at']);
        await queryInterface.addIndex('Clinical_Payment', ['claim_settlement_date']);
        await queryInterface.addIndex('Clinical_Payment', ['insurance_provider']);
        await queryInterface.addIndex('Clinical_Payment', ['policy_number']);
        await queryInterface.addIndex('Clinical_Payment', ['claim_network_status']);
        await queryInterface.addIndex('Clinical_Payment', ['claim_appeal_status']);
      } catch (error) {
        // Indexes might already exist, ignore error
        console.log('Some indexes might already exist for Clinical_Payment table');
      }

      console.log('✅ Successfully enhanced Clinical_Payment table with insurance fields');
    } catch (error) {
      console.error('❌ Error enhancing Clinical_Payment table:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove the added columns
      const columnsToRemove = [
        'claim_reference',
        'claim_date',
        'claim_status',
        'claim_notes',
        'claim_submitted_at',
        'claim_submitted_by',
        'claim_approved_at',
        'claim_approved_by',
        'claim_rejected_at',
        'claim_rejection_reason',
        'claim_approved_amount',
        'claim_partial_approval_reason',
        'claim_settlement_method',
        'claim_settlement_reference',
        'claim_settlement_date',
        'claim_settled_by',
        'claim_settlement_notes',
        'claim_processing_fee',
        'claim_administrative_fee',
        'claim_deductible_amount',
        'claim_coinsurance_percentage',
        'claim_out_of_pocket_maximum',
        'claim_benefit_period_start',
        'claim_benefit_period_end',
        'claim_network_status',
        'claim_prior_authorization',
        'claim_prior_authorization_date',
        'claim_denial_code',
        'claim_denial_description',
        'claim_appeal_deadline',
        'claim_appeal_status',
        'claim_appeal_date',
        'claim_appeal_notes',
      ];

      for (const column of columnsToRemove) {
        try {
          await queryInterface.removeColumn('Clinical_Payment', column);
        } catch (error) {
          // Column might not exist, ignore error
          console.log(`Column ${column} might not exist in Clinical_Payment table`);
        }
      }

      // Remove the ENUM types
      try {
        await queryInterface.sequelize.query(`
          DROP TYPE IF EXISTS "enum_Clinical_Payment_claim_status"
        `);
        await queryInterface.sequelize.query(`
          DROP TYPE IF EXISTS "enum_Clinical_Payment_claim_settlement_method"
        `);
        await queryInterface.sequelize.query(`
          DROP TYPE IF EXISTS "enum_Clinical_Payment_claim_network_status"
        `);
        await queryInterface.sequelize.query(`
          DROP TYPE IF EXISTS "enum_Clinical_Payment_claim_appeal_status"
        `);
      } catch (error) {
        // ENUM types might not exist, ignore error
        console.log('Some ENUM types might not exist for Clinical_Payment table');
      }

      console.log('✅ Successfully reverted Clinical_Payment table insurance enhancements');
    } catch (error) {
      console.error('❌ Error reverting Clinical_Payment table insurance enhancements:', error);
      throw error;
    }
  },
};
