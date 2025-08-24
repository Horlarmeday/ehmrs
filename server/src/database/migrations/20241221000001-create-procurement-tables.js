'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Procurement Orders table
    await queryInterface.createTable('Procurement_Orders', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      po_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      vendor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Vendors',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'APPROVED', 'SENT', 'RECEIVED', 'CANCELLED'),
        defaultValue: 'DRAFT',
      },
      total_amount: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
      },
      order_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      expected_delivery_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      actual_delivery_date: {
        type: Sequelize.DATE,
        allowNull: true,
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
      delivery_address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      contact_person: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      contact_phone: {
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

    // Create Procurement Order Items table
    await queryInterface.createTable('Procurement_Order_Items', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      procurement_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Procurement_Orders',
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
      quantity_ordered: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      quantity_received: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      unit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Units',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      unit_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      total_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      receipt_status: {
        type: Sequelize.ENUM('PENDING', 'PARTIAL', 'COMPLETE'),
        defaultValue: 'PENDING',
      },
      date_received: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      batch_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      expiration_date: {
        type: Sequelize.DATE,
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
    await queryInterface.addIndex('Procurement_Orders', ['po_number']);
    await queryInterface.addIndex('Procurement_Orders', ['vendor_id']);
    await queryInterface.addIndex('Procurement_Orders', ['status']);
    await queryInterface.addIndex('Procurement_Orders', ['created_by']);
    await queryInterface.addIndex('Procurement_Order_Items', ['procurement_order_id']);
    await queryInterface.addIndex('Procurement_Order_Items', ['drug_id']);
    await queryInterface.addIndex('Procurement_Order_Items', ['receipt_status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Procurement_Order_Items');
    await queryInterface.dropTable('Procurement_Orders');
  },
};
