'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      console.log('Creating GeneralStore dispensary tables...');

      // Step 1: Create General_Store_Dispensaries table
      console.log('Creating General_Store_Dispensaries table...');
      await queryInterface.createTable(
        'General_Store_Dispensaries',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          name: {
            type: Sequelize.STRING(255),
            allowNull: false,
            validate: {
              notEmpty: { msg: 'Dispensary name is required' },
            },
          },
          department_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'departments',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          location: {
            type: Sequelize.STRING(255),
            allowNull: true,
          },
          accepted_item_types: {
            type: Sequelize.ENUM(
              'medical_supplies',
              'consumables',
              'equipment',
              'laboratory',
              'all'
            ),
            allowNull: false,
            defaultValue: 'all',
          },
          funding_source: {
            type: Sequelize.ENUM('hospital', 'donor', 'research', 'department_budget'),
            allowNull: false,
            defaultValue: 'hospital',
          },
          status: {
            type: Sequelize.ENUM('active', 'inactive'),
            allowNull: false,
            defaultValue: 'active',
          },
          manager_staff_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'staffs',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          minimum_stock_level: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 10,
          },
          maximum_stock_level: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1000,
          },
          auto_replenish: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          notes: {
            type: Sequelize.TEXT,
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
        },
        {
          transaction,
          indexes: [
            {
              name: 'idx_general_store_dispensary_department',
              fields: ['department_id'],
            },
            {
              name: 'idx_general_store_dispensary_manager',
              fields: ['manager_staff_id'],
            },
            {
              name: 'idx_general_store_dispensary_status',
              fields: ['status'],
            },
            {
              name: 'idx_general_store_dispensary_item_types',
              fields: ['accepted_item_types'],
            },
          ],
        }
      );

      // Step 2: Create General_Store_Dispensary_Items table
      console.log('Creating General_Store_Dispensary_Items table...');
      await queryInterface.createTable(
        'General_Store_Dispensary_Items',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          dispensary_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'General_Store_Dispensaries',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          item_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'General_Store_Items',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          quantity_received: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
              min: { args: [0], msg: 'Quantity received cannot be negative' },
            },
          },
          quantity_remaining: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
              min: { args: [0], msg: 'Quantity remaining cannot be negative' },
            },
          },
          quantity_reserved: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
              min: { args: [0], msg: 'Quantity reserved cannot be negative' },
            },
          },
          unit_cost: {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0.0,
            validate: {
              min: { args: [0], msg: 'Unit cost cannot be negative' },
            },
          },
          total_value: {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0.0,
          },
          batch_number: {
            type: Sequelize.STRING(100),
            allowNull: true,
          },
          expiration_date: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          status: {
            type: Sequelize.ENUM('active', 'expired', 'damaged', 'recalled'),
            allowNull: false,
            defaultValue: 'active',
          },
          last_movement_date: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          received_from_type: {
            type: Sequelize.ENUM('main_store', 'other_dispensary', 'procurement', 'transfer'),
            allowNull: true,
          },
          received_from_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          notes: {
            type: Sequelize.TEXT,
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
        },
        {
          transaction,
          indexes: [
            {
              name: 'idx_general_store_dispensary_item_dispensary',
              fields: ['dispensary_id'],
            },
            {
              name: 'idx_general_store_dispensary_item_item',
              fields: ['item_id'],
            },
            {
              name: 'idx_general_store_dispensary_item_batch',
              fields: ['batch_number'],
            },
            {
              name: 'idx_general_store_dispensary_item_expiry',
              fields: ['expiration_date'],
            },
            {
              name: 'idx_general_store_dispensary_item_status',
              fields: ['status'],
            },
            {
              name: 'unique_dispensary_item_batch',
              unique: true,
              fields: ['dispensary_id', 'item_id', 'batch_number'],
            },
          ],
        }
      );

      // Step 3: Add laboratory categories to General_Store_Categories if not exists
      console.log('Adding laboratory categories...');

      // Check if laboratory category exists
      const [
        labCategory,
      ] = await queryInterface.sequelize.query(
        "SELECT id FROM General_Store_Categories WHERE name = 'Laboratory Supplies'",
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      let labCategoryId;
      if (!labCategory) {
        // Insert laboratory main category
        const [insertResult] = await queryInterface.sequelize.query(
          `INSERT INTO General_Store_Categories (name, description, parent_id, is_active, created_by, updated_by, createdAt, updatedAt) 
           VALUES ('Laboratory Supplies', 'All laboratory-related inventory items', NULL, true, 1, 1, NOW(), NOW())`,
          { transaction }
        );

        // Get the inserted category ID
        const [
          newCategory,
        ] = await queryInterface.sequelize.query(
          "SELECT id FROM General_Store_Categories WHERE name = 'Laboratory Supplies'",
          { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
        );
        labCategoryId = newCategory.id;
      } else {
        labCategoryId = labCategory.id;
      }

      // Insert laboratory subcategories
      const labSubcategories = [
        { name: 'Clinical Chemistry', description: 'Chemistry department supplies' },
        { name: 'Hematology', description: 'Hematology department supplies' },
        { name: 'Microbiology', description: 'Microbiology department supplies' },
        { name: 'Pathology', description: 'Pathology department supplies' },
        { name: 'Laboratory Equipment', description: 'Laboratory equipment and instruments' },
        { name: 'Reagents', description: 'Chemical reagents and solutions' },
        { name: 'Test Kits', description: 'Diagnostic test kits and components' },
        { name: 'Lab Consumables', description: 'Laboratory consumables and disposables' },
      ];

      for (const subcategory of labSubcategories) {
        // Check if subcategory exists
        const [
          existingSubcat,
        ] = await queryInterface.sequelize.query(
          `SELECT id FROM General_Store_Subcategories WHERE name = '${subcategory.name}' AND category_id = ${labCategoryId}`,
          { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
        );

        if (!existingSubcat) {
          await queryInterface.sequelize.query(
            `INSERT INTO General_Store_Subcategories (name, category_id, description, is_active, created_by, updated_by, createdAt, updatedAt) 
             VALUES ('${subcategory.name}', ${labCategoryId}, '${subcategory.description}', true, 1, 1, NOW(), NOW())`,
            { transaction }
          );
        }
      }

      await transaction.commit();
      console.log('GeneralStore dispensary tables created successfully!');
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating GeneralStore dispensary tables:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      console.log('Dropping GeneralStore dispensary tables...');

      // Drop tables in reverse order
      await queryInterface.dropTable('General_Store_Dispensary_Items', { transaction });
      await queryInterface.dropTable('General_Store_Dispensaries', { transaction });

      // Remove laboratory categories and subcategories
      await queryInterface.sequelize.query(
        "DELETE FROM General_Store_Subcategories WHERE category_id IN (SELECT id FROM General_Store_Categories WHERE name = 'Laboratory Supplies')",
        { transaction }
      );
      await queryInterface.sequelize.query(
        "DELETE FROM General_Store_Categories WHERE name = 'Laboratory Supplies'",
        { transaction }
      );

      await transaction.commit();
      console.log('GeneralStore dispensary tables dropped successfully!');
    } catch (error) {
      await transaction.rollback();
      console.error('Error dropping GeneralStore dispensary tables:', error);
      throw error;
    }
  },
};
