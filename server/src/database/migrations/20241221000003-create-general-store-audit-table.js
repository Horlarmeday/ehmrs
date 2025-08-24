'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('general_store_audit_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      staff_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'staffs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      module: {
        type: Sequelize.ENUM('CATEGORY', 'SUBCATEGORY', 'ITEM', 'MOVEMENT', 'REQUEST', 'REPORT', 'SYSTEM'),
        allowNull: false
      },
      action: {
        type: Sequelize.ENUM('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'APPROVE', 'REJECT', 'FULFILL', 'STOCK_IN', 'STOCK_OUT', 'STOCK_ADJUSTMENT', 'STOCK_TRANSFER', 'EXPORT', 'LOGIN', 'LOGOUT'),
        allowNull: false
      },
      entity_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      old_values: {
        type: Sequelize.JSON,
        allowNull: true
      },
      new_values: {
        type: Sequelize.JSON,
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      user_agent: {
        type: Sequelize.STRING,
        allowNull: true
      },
      session_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_successful: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
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

    // Add indexes for better performance
    await queryInterface.addIndex('general_store_audit_logs', ['staff_id']);
    await queryInterface.addIndex('general_store_audit_logs', ['module']);
    await queryInterface.addIndex('general_store_audit_logs', ['action']);
    await queryInterface.addIndex('general_store_audit_logs', ['entity_type']);
    await queryInterface.addIndex('general_store_audit_logs', ['entity_id']);
    await queryInterface.addIndex('general_store_audit_logs', ['created_at']);
    await queryInterface.addIndex('general_store_audit_logs', ['is_successful']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('general_store_audit_logs');
  }
};
