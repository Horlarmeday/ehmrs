'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('audit_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      operation: {
        type: Sequelize.ENUM('upload', 'download', 'delete', 'view', 'approve', 'update', 'access'),
        allowNull: false,
        comment: 'Type of operation performed',
      },
      resource_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Type of resource (e.g., investigation_image, patient_record, etc.)',
      },
      resource_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID of the affected resource',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID of the user who performed the action',
      },
      user_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Type of user (staff, admin, system, etc.)',
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'IP address of the requester (supports IPv4 and IPv6)',
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Browser/client user agent string',
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Additional metadata about the operation (JSON format)',
      },
      status: {
        type: Sequelize.ENUM('success', 'failure', 'warning'),
        allowNull: false,
        defaultValue: 'success',
        comment: 'Status of the operation',
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Error message if operation failed',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes for common query patterns
    await queryInterface.addIndex('audit_logs', ['user_id'], {
      name: 'idx_audit_logs_user_id',
    });

    await queryInterface.addIndex('audit_logs', ['resource_type', 'resource_id'], {
      name: 'idx_audit_logs_resource',
    });

    await queryInterface.addIndex('audit_logs', ['operation'], {
      name: 'idx_audit_logs_operation',
    });

    await queryInterface.addIndex('audit_logs', ['created_at'], {
      name: 'idx_audit_logs_created_at',
    });

    await queryInterface.addIndex('audit_logs', ['status'], {
      name: 'idx_audit_logs_status',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('audit_logs');
  },
};
