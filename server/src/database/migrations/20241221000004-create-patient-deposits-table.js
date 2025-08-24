'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('patient_deposits', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'patients',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      deposit_type: {
        type: Sequelize.ENUM('CASH', 'BANK_TRANSFER', 'CARD', 'MOBILE_MONEY', 'OTHER'),
        allowNull: false
      },
      reference_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'USED', 'REFUNDED', 'EXPIRED'),
        allowNull: false,
        defaultValue: 'ACTIVE'
      },
      expiry_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'staff',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'staff',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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

    // Add indexes
    await queryInterface.addIndex('patient_deposits', ['patient_id']);
    await queryInterface.addIndex('patient_deposits', ['reference_number'], { unique: true });
    await queryInterface.addIndex('patient_deposits', ['status']);
    await queryInterface.addIndex('patient_deposits', ['deposit_type']);
    await queryInterface.addIndex('patient_deposits', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('patient_deposits');
  }
};
