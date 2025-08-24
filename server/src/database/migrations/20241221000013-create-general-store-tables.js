'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      console.log('Creating General Store module tables...');

      // Step 1: Create General_Store_Categories table
      console.log('Creating General_Store_Categories table...');
      await queryInterface.createTable('General_Store_Categories', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        name: { type: Sequelize.STRING, allowNull: false },
        description: { type: Sequelize.TEXT, allowNull: true },
        parent_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'General_Store_Categories', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
        is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        created_by: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'staffs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        updated_by: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'staffs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      }, { transaction });

      // Step 2: Create General_Store_Subcategories table
      console.log('Creating General_Store_Subcategories table...');
      await queryInterface.createTable('General_Store_Subcategories', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        name: { type: Sequelize.STRING, allowNull: false },
        category_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'General_Store_Categories', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        description: { type: Sequelize.TEXT, allowNull: true },
        is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        created_by: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'staffs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        updated_by: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'staffs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      }, { transaction });

      // Step 3: Create General_Store_Items table
      console.log('Creating General_Store_Items table...');
      await queryInterface.createTable('General_Store_Items', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        item_code: { type: Sequelize.STRING, allowNull: false, unique: true },
        name: { type: Sequelize.STRING, allowNull: false },
        description: { type: Sequelize.TEXT, allowNull: true },
        category_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'General_Store_Categories', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        subcategory_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'General_Store_Subcategories', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        unit_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'units', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        manufacturer: { type: Sequelize.STRING, allowNull: true },
        model_number: { type: Sequelize.STRING, allowNull: true },
        specifications: { type: Sequelize.TEXT, allowNull: true },
        minimum_stock: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        maximum_stock: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1000 },
        current_stock: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        reserved_stock: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        unit_cost: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        total_value: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        location: { type: Sequelize.STRING, allowNull: false },
        shelf_number: { type: Sequelize.STRING, allowNull: true },
        expiry_date: { type: Sequelize.DATE, allowNull: true },
        is_expirable: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        is_serialized: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        is_lot_tracked: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        status: { type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'DISCONTINUED'), allowNull: false, defaultValue: 'ACTIVE' },
        supplier_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'vendors', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
        created_by: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'staffs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        updated_by: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'staffs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      }, { transaction });

      // Step 4: Create General_Store_Movements table
      console.log('Creating General_Store_Movements table...');
      await queryInterface.createTable('General_Store_Movements', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        item_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'General_Store_Items', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        movement_type: { type: Sequelize.ENUM('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'), allowNull: false },
        quantity: { type: Sequelize.INTEGER, allowNull: false },
        unit_cost: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
        total_cost: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
        reference_type: { type: Sequelize.STRING, allowNull: false },
        reference_id: { type: Sequelize.INTEGER, allowNull: false },
        from_location: { type: Sequelize.STRING, allowNull: true },
        to_location: { type: Sequelize.STRING, allowNull: true },
        notes: { type: Sequelize.TEXT, allowNull: true },
        staff_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'staffs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        movement_date: { type: Sequelize.DATE, allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      }, { transaction });

      // Step 5: Create General_Store_Requests table
      console.log('Creating General_Store_Requests table...');
      await queryInterface.createTable('General_Store_Requests', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        request_number: { type: Sequelize.STRING, allowNull: false, unique: true },
        requesting_department: { type: Sequelize.STRING, allowNull: false },
        requested_by: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'staffs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        approved_by: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'staffs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
        status: { type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED', 'FULFILLED', 'PARTIALLY_FULFILLED'), allowNull: false, defaultValue: 'PENDING' },
        priority: { type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'), allowNull: false, defaultValue: 'MEDIUM' },
        request_date: { type: Sequelize.DATE, allowNull: false },
        required_date: { type: Sequelize.DATE, allowNull: false },
        notes: { type: Sequelize.TEXT, allowNull: true },
        total_cost: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        rejection_reason: { type: Sequelize.TEXT, allowNull: true },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      }, { transaction });

      // Step 6: Create General_Store_Request_Items table
      console.log('Creating General_Store_Request_Items table...');
      await queryInterface.createTable('General_Store_Request_Items', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        request_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'General_Store_Requests', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
        item_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'General_Store_Items', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        quantity_requested: { type: Sequelize.INTEGER, allowNull: false },
        quantity_approved: { type: Sequelize.INTEGER, allowNull: true },
        quantity_issued: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        unit_cost: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
        total_cost: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        notes: { type: Sequelize.TEXT, allowNull: true },
        status: { type: Sequelize.ENUM('PENDING', 'APPROVED', 'ISSUED', 'PARTIALLY_ISSUED'), allowNull: false, defaultValue: 'PENDING' },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      }, { transaction });

      // Step 7: Create indexes for performance optimization
      console.log('Creating indexes for performance optimization...');
      
      // General_Store_Items indexes
      await queryInterface.addIndex('General_Store_Items', ['item_code'], { unique: true, transaction });
      await queryInterface.addIndex('General_Store_Items', ['category_id'], { transaction });
      await queryInterface.addIndex('General_Store_Items', ['subcategory_id'], { transaction });
      await queryInterface.addIndex('General_Store_Items', ['status'], { transaction });
      await queryInterface.addIndex('General_Store_Items', ['supplier_id'], { transaction });
      await queryInterface.addIndex('General_Store_Items', ['current_stock'], { transaction });
      await queryInterface.addIndex('General_Store_Items', ['expiry_date'], { transaction });

      // General_Store_Categories indexes
      await queryInterface.addIndex('General_Store_Categories', ['parent_id'], { transaction });
      await queryInterface.addIndex('General_Store_Categories', ['is_active'], { transaction });

      // General_Store_Subcategories indexes
      await queryInterface.addIndex('General_Store_Subcategories', ['category_id'], { transaction });
      await queryInterface.addIndex('General_Store_Subcategories', ['is_active'], { transaction });

      // General_Store_Movements indexes
      await queryInterface.addIndex('General_Store_Movements', ['item_id'], { transaction });
      await queryInterface.addIndex('General_Store_Movements', ['movement_type'], { transaction });
      await queryInterface.addIndex('General_Store_Movements', ['movement_date'], { transaction });
      await queryInterface.addIndex('General_Store_Movements', ['staff_id'], { transaction });
      await queryInterface.addIndex('General_Store_Movements', ['reference_type', 'reference_id'], { transaction });

      // General_Store_Requests indexes
      await queryInterface.addIndex('General_Store_Requests', ['request_number'], { unique: true, transaction });
      await queryInterface.addIndex('General_Store_Requests', ['requesting_department'], { transaction });
      await queryInterface.addIndex('General_Store_Requests', ['status'], { transaction });
      await queryInterface.addIndex('General_Store_Requests', ['priority'], { transaction });
      await queryInterface.addIndex('General_Store_Requests', ['request_date'], { transaction });
      await queryInterface.addIndex('General_Store_Requests', ['requested_by'], { transaction });
      await queryInterface.addIndex('General_Store_Requests', ['approved_by'], { transaction });

      // General_Store_Request_Items indexes
      await queryInterface.addIndex('General_Store_Request_Items', ['request_id'], { transaction });
      await queryInterface.addIndex('General_Store_Request_Items', ['item_id'], { transaction });
      await queryInterface.addIndex('General_Store_Request_Items', ['status'], { transaction });

      await transaction.commit();
      console.log('General Store module tables created successfully!');
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating General Store module tables:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      console.log('Rolling back General Store module tables...');

      // Drop tables in reverse order due to foreign key constraints
      await queryInterface.dropTable('General_Store_Request_Items', { transaction });
      await queryInterface.dropTable('General_Store_Requests', { transaction });
      await queryInterface.dropTable('General_Store_Movements', { transaction });
      await queryInterface.dropTable('General_Store_Items', { transaction });
      await queryInterface.dropTable('General_Store_Subcategories', { transaction });
      await queryInterface.dropTable('General_Store_Categories', { transaction });

      await transaction.commit();
      console.log('General Store module tables rolled back successfully!');
    } catch (error) {
      await transaction.rollback();
      console.error('Error rolling back General Store module tables:', error);
      throw error;
    }
  }
};
