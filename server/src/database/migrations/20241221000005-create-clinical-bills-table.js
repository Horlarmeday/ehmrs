'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('clinical_bills', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      bill_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
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
      visit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'visits',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      final_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      billing_mode: {
        type: Sequelize.ENUM('CASH', 'INSURANCE', 'WAIVER', 'OTHER', 'FREE', 'WALLET'),
        allowNull: false,
      },
      patient_co_pay_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      hmo_billed_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      payment_status: {
        type: Sequelize.ENUM('PENDING', 'PARTIAL', 'PAID', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      billing_status: {
        type: Sequelize.ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED'),
        allowNull: false,
        defaultValue: 'DRAFT',
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
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
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'staff',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    await queryInterface.addIndex('clinical_bills', ['bill_number'], { unique: true });
    await queryInterface.addIndex('clinical_bills', ['patient_id']);
    await queryInterface.addIndex('clinical_bills', ['visit_id']);
    await queryInterface.addIndex('clinical_bills', ['billing_mode']);
    await queryInterface.addIndex('clinical_bills', ['payment_status']);
    await queryInterface.addIndex('clinical_bills', ['billing_status']);
    await queryInterface.addIndex('clinical_bills', ['due_date']);
    await queryInterface.addIndex('clinical_bills', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('clinical_bills');
  },
};
