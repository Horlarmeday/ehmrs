'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Create bank_transfers table
      await queryInterface.createTable('bank_transfers', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        payment_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'clinical_payments',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        bank_account_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Bank_Accounts',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        transfer_date: {
          type: Sequelize.DATE,
          allowNull: false,
          comment: 'Date when bank transfer was initiated',
        },
        expected_settlement_date: {
          type: Sequelize.DATE,
          allowNull: false,
          comment: 'Expected date when bank transfer will be settled',
        },
        transfer_fee: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Bank transfer fee amount',
        },
        transfer_status: {
          type: Sequelize.ENUM('PENDING', 'CONFIRMED', 'SETTLED', 'FAILED', 'CANCELLED'),
          allowNull: false,
          defaultValue: 'PENDING',
          comment: 'Status of the bank transfer process',
        },
        confirmed_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when bank transfer was confirmed',
        },
        confirmed_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Staff',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          comment: 'Staff member who confirmed the bank transfer',
        },
        settled_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when bank transfer was settled',
        },
        settled_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Staff',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          comment: 'Staff member who settled the bank transfer',
        },
        settlement_reference: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Reference number for bank transfer settlement',
        },
        bank_statement_reference: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Reference from bank statement for reconciliation',
        },
        confirmation_reference: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Reference number for bank transfer confirmation',
        },
        transfer_notes: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Additional notes about the bank transfer',
        },
        transfer_attempts: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Number of transfer attempts made',
        },
        last_transfer_attempt: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date of last transfer attempt',
        },
        transfer_error_message: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Error message from last transfer attempt',
        },
        transfer_processor: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Name of the transfer processor used',
        },
        transfer_processor_reference: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Reference from the transfer processor',
        },
        transfer_currency: {
          type: Sequelize.STRING(10),
          allowNull: false,
          defaultValue: 'NGN',
          comment: 'Currency of the transfer',
        },
        exchange_rate: {
          type: Sequelize.DECIMAL(10, 6),
          allowNull: false,
          defaultValue: 1,
          comment: 'Exchange rate if different from base currency',
        },
        original_amount: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: true,
          comment: 'Original amount in original currency',
        },
        original_currency: {
          type: Sequelize.STRING(10),
          allowNull: true,
          comment: 'Original currency of the transfer',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      });

      // Create insurance_claims table
      await queryInterface.createTable('insurance_claims', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        payment_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'clinical_payments',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        claim_reference: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true,
          comment: 'Unique claim reference number',
        },
        claim_date: {
          type: Sequelize.DATE,
          allowNull: false,
          comment: 'Date when claim was submitted',
        },
        claim_amount: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          comment: 'Total claim amount',
        },
        copay_amount: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Co-payment amount required from patient',
        },
        insurance_coverage: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          comment: 'Amount covered by insurance',
        },
        claim_status: {
          type: Sequelize.ENUM(
            'PENDING',
            'SUBMITTED',
            'APPROVED',
            'REJECTED',
            'PAID',
            'PARTIALLY_APPROVED'
          ),
          allowNull: false,
          defaultValue: 'PENDING',
          comment: 'Status of the insurance claim',
        },
        rejection_reason: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Reason for rejection if claim is rejected',
        },
        approval_date: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when claim was approved',
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
          comment: 'Staff member who approved the claim',
        },
        settlement_date: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when claim was settled',
        },
        settlement_method: {
          type: Sequelize.ENUM('BANK_TRANSFER', 'CHECK', 'CASH', 'ELECTRONIC'),
          allowNull: true,
          comment: 'Method used for claim settlement',
        },
        settlement_reference: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Reference number for claim settlement',
        },
        bank_reference: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Bank reference for settlement',
        },
        check_number: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Check number if settlement is by check',
        },
        processing_fee: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Processing fee for the claim',
        },
        administrative_fee: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Administrative fee for the claim',
        },
        deductible_amount: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Deductible amount for the claim',
        },
        coinsurance_percentage: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Co-insurance percentage',
        },
        out_of_pocket_maximum: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Out-of-pocket maximum for the claim',
        },
        benefit_period_start: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Start of benefit period',
        },
        benefit_period_end: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'End of benefit period',
        },
        network_status: {
          type: Sequelize.ENUM('IN_NETWORK', 'OUT_OF_NETWORK', 'UNKNOWN'),
          allowNull: false,
          defaultValue: 'UNKNOWN',
          comment: 'Network status for the claim',
        },
        prior_authorization_required: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Whether prior authorization is required',
        },
        prior_authorization_date: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date of prior authorization',
        },
        denial_code: {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'Denial code if claim is denied',
        },
        denial_description: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Description of denial reason',
        },
        appeal_deadline: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Deadline for filing an appeal',
        },
        appeal_status: {
          type: Sequelize.ENUM('NOT_APPEALED', 'APPEALED', 'APPEAL_GRANTED', 'APPEAL_DENIED'),
          allowNull: false,
          defaultValue: 'NOT_APPEALED',
          comment: 'Status of any appeal filed',
        },
        appeal_date: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when appeal was filed',
        },
        appeal_notes: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Notes about the appeal',
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Additional notes about the claim',
        },
        submitted_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when claim was submitted',
        },
        submitted_by: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Staff',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
          comment: 'Staff member who submitted the claim',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      });

      // Create pos_terminal_transactions table
      await queryInterface.createTable('pos_terminal_transactions', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        payment_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'clinical_payments',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        terminal_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'pos_terminals',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        transaction_id: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: 'Unique transaction ID from POS terminal',
        },
        authorization_code: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Authorization code from payment processor',
        },
        card_type: {
          type: Sequelize.STRING(50),
          allowNull: false,
          comment: 'Type of card used (VISA, MASTERCARD, etc.)',
        },
        card_last_four: {
          type: Sequelize.STRING(4),
          allowNull: false,
          comment: 'Last four digits of the card',
        },
        transaction_status: {
          type: Sequelize.ENUM('PENDING', 'APPROVED', 'DECLINED', 'CANCELLED', 'REFUNDED'),
          allowNull: false,
          defaultValue: 'PENDING',
          comment: 'Status of the POS transaction',
        },
        transaction_amount: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          comment: 'Transaction amount',
        },
        transaction_fee: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Transaction fee charged',
        },
        merchant_discount_rate: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Merchant discount rate applied',
        },
        processor_reference: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Reference from payment processor',
        },
        batch_number: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Batch number for settlement',
        },
        settlement_date: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when transaction was settled',
        },
        settlement_status: {
          type: Sequelize.ENUM('PENDING', 'SETTLED', 'FAILED', 'CANCELLED'),
          allowNull: false,
          defaultValue: 'PENDING',
          comment: 'Settlement status of the transaction',
        },
        settlement_reference: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Settlement reference number',
        },
        settled_amount: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Amount settled to merchant account',
        },
        error_message: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Error message if transaction failed',
        },
        error_code: {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'Error code if transaction failed',
        },
        response_code: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Response code from payment processor',
        },
        response_message: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Response message from payment processor',
        },
        avs_result: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'AVS (Address Verification System) result',
        },
        cvv_result: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'CVV (Card Verification Value) result',
        },
        issuer_response: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Card issuer response',
        },
        association_response: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Card association response',
        },
        merchant_category_code: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Merchant category code',
        },
        terminal_identification_code: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Terminal identification code',
        },
        merchant_identification_number: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Merchant identification number',
        },
        acquirer_institution_id: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Acquirer institution identification',
        },
        issuer_institution_id: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Issuer institution identification',
        },
        cavv: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Cardholder authentication verification value',
        },
        eci: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Electronic commerce indicator',
        },
        ucaf: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Universal cardholder authentication field',
        },
        cavv_response: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Cardholder authentication verification response',
        },
        xid: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'XID (Transaction ID) for 3D Secure',
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Additional transaction notes',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      });

      // Create cash_transactions table
      await queryInterface.createTable('cash_transactions', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        payment_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'clinical_payments',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        register_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'cash_registers',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        movement_type: {
          type: Sequelize.ENUM(
            'CASH_IN',
            'CASH_OUT',
            'PAYMENT_RECEIVED',
            'REFUND_GIVEN',
            'ADJUSTMENT'
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
          comment: 'Balance before the movement',
        },
        new_balance: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          comment: 'Balance after the movement',
        },
        reference_number: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Reference number for the transaction',
        },
        transaction_reference: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Transaction reference from payment system',
        },
        status: {
          type: Sequelize.ENUM('PENDING', 'COMPLETED', 'CANCELLED', 'REVERSED'),
          allowNull: false,
          defaultValue: 'PENDING',
          comment: 'Status of the cash transaction',
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Description of the cash movement',
        },
        needs_approval: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Whether the transaction needs approval',
        },
        is_approved: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Whether the transaction has been approved',
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
          comment: 'Staff member who approved the transaction',
        },
        approved_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when transaction was approved',
        },
        can_be_reversed: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Whether the transaction can be reversed',
        },
        is_reversed: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Whether the transaction has been reversed',
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
          comment: 'Staff member who reversed the transaction',
        },
        reversed_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when transaction was reversed',
        },
        reversal_reason: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Reason for reversal',
        },
        receipt_number: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Receipt number for the transaction',
        },
        invoice_number: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Invoice number for the transaction',
        },
        customer_name: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Customer name for the transaction',
        },
        customer_phone: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Customer phone for the transaction',
        },
        customer_email: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Customer email for the transaction',
        },
        payment_method: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Payment method used (CASH, CHECK, etc.)',
        },
        check_number: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Check number if payment is by check',
        },
        bank_name: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Bank name if payment is by check',
        },
        account_number: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Account number if payment is by check',
        },
        routing_number: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Routing number if payment is by check',
        },
        currency: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Currency used for the transaction',
        },
        exchange_rate: {
          type: Sequelize.DECIMAL(10, 6),
          allowNull: false,
          defaultValue: 1,
          comment: 'Exchange rate if different from base currency',
        },
        original_amount: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: true,
          comment: 'Original amount in original currency',
        },
        original_currency: {
          type: Sequelize.STRING(10),
          allowNull: true,
          comment: 'Original currency of the transaction',
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Additional notes about the transaction',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      });

      // Add indexes for performance
      await queryInterface.addIndex('bank_transfers', ['payment_id']);
      await queryInterface.addIndex('bank_transfers', ['bank_account_id']);
      await queryInterface.addIndex('bank_transfers', ['transfer_status']);
      await queryInterface.addIndex('bank_transfers', ['transfer_date']);

      await queryInterface.addIndex('insurance_claims', ['payment_id']);
      await queryInterface.addIndex('insurance_claims', ['claim_reference']);
      await queryInterface.addIndex('insurance_claims', ['claim_status']);
      await queryInterface.addIndex('insurance_claims', ['claim_date']);

      await queryInterface.addIndex('pos_terminal_transactions', ['payment_id']);
      await queryInterface.addIndex('pos_terminal_transactions', ['terminal_id']);
      await queryInterface.addIndex('pos_terminal_transactions', ['transaction_id']);
      await queryInterface.addIndex('pos_terminal_transactions', ['transaction_status']);

      await queryInterface.addIndex('cash_transactions', ['payment_id']);
      await queryInterface.addIndex('cash_transactions', ['register_id']);
      await queryInterface.addIndex('cash_transactions', ['movement_type']);
      await queryInterface.addIndex('cash_transactions', ['status']);

      console.log('✅ Payment method-specific tables created successfully');
    } catch (error) {
      console.error('❌ Error creating payment method-specific tables:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Drop tables in reverse order
      await queryInterface.dropTable('cash_transactions');
      await queryInterface.dropTable('pos_terminal_transactions');
      await queryInterface.dropTable('insurance_claims');
      await queryInterface.dropTable('bank_transfers');

      console.log('✅ Payment method-specific tables dropped successfully');
    } catch (error) {
      console.error('❌ Error dropping payment method-specific tables:', error);
      throw error;
    }
  },
};
