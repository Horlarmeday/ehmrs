'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('deposit_audit_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
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
      action_type: {
        type: Sequelize.ENUM(
          'CREATE',
          'UPDATE',
          'DELETE',
          'STATUS_CHANGE',
          'BALANCE_CHANGE',
          'REFUND_PROCESSED',
          'USAGE_PROCESSED',
          'ADJUSTMENT_MADE',
          'RECONCILIATION',
          'EXPIRY_PROCESSED',
          'MANUAL_OVERRIDE',
          'SYSTEM_MAINTENANCE'
        ),
        allowNull: false,
      },
      severity: {
        type: Sequelize.ENUM('INFO', 'WARNING', 'ERROR', 'CRITICAL'),
        defaultValue: 'INFO',
        allowNull: false,
      },
      action_description: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      old_values: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      new_values: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      performed_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'staff',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      session_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      request_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      endpoint: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      http_method: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      response_status: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      response_time_ms: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      is_system_action: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      stack_trace: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex('deposit_audit_logs', ['deposit_id']);
    await queryInterface.addIndex('deposit_audit_logs', ['action_type']);
    await queryInterface.addIndex('deposit_audit_logs', ['severity']);
    await queryInterface.addIndex('deposit_audit_logs', ['performed_by']);
    await queryInterface.addIndex('deposit_audit_logs', ['createdAt']);
    await queryInterface.addIndex('deposit_audit_logs', ['action_type', 'createdAt']);
    await queryInterface.addIndex('deposit_audit_logs', ['deposit_id', 'createdAt']);
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes first
    await queryInterface.removeIndex('deposit_audit_logs', ['deposit_id']);
    await queryInterface.removeIndex('deposit_audit_logs', ['action_type']);
    await queryInterface.removeIndex('deposit_audit_logs', ['severity']);
    await queryInterface.removeIndex('deposit_audit_logs', ['performed_by']);
    await queryInterface.removeIndex('deposit_audit_logs', ['createdAt']);
    await queryInterface.removeIndex('deposit_audit_logs', ['action_type', 'createdAt']);
    await queryInterface.removeIndex('deposit_audit_logs', ['deposit_id', 'createdAt']);

    // Drop the table
    await queryInterface.dropTable('deposit_audit_logs');
  },
};
