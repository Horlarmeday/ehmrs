'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Stock Audits table
    await queryInterface.createTable('Stock_Audits', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      audit_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      store_type: {
        type: Sequelize.ENUM('PHARMACY', 'LABORATORY', 'RADIOLOGY'),
        allowNull: false,
      },
      inventory_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Inventories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      audit_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'APPROVED'),
        defaultValue: 'DRAFT',
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Staffs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Staffs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      approved_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      total_variance_value: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
      },
      total_items_audited: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      total_items_with_variance: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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

    // Create Stock Audit Items table
    await queryInterface.createTable('Stock_Audit_Items', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      stock_audit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Stock_Audits',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      drug_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Drugs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      system_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      physical_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      variance: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      variance_value: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      unit_cost: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      counted_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Staffs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      count_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      batch_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shelf_location: {
        type: Sequelize.STRING,
        allowNull: true,
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

    // Add indexes for better performance
    await queryInterface.addIndex('Stock_Audits', ['audit_number']);
    await queryInterface.addIndex('Stock_Audits', ['store_type']);
    await queryInterface.addIndex('Stock_Audits', ['inventory_id']);
    await queryInterface.addIndex('Stock_Audits', ['status']);
    await queryInterface.addIndex('Stock_Audits', ['created_by']);
    await queryInterface.addIndex('Stock_Audit_Items', ['stock_audit_id']);
    await queryInterface.addIndex('Stock_Audit_Items', ['drug_id']);
    await queryInterface.addIndex('Stock_Audit_Items', ['counted_by']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Stock_Audit_Items');
    await queryInterface.dropTable('Stock_Audits');
  },
};
