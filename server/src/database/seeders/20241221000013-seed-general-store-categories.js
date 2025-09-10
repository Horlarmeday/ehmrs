'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      console.log('Seeding General Store categories and subcategories...');

      // Step 1: Insert main categories
      const categories = await queryInterface.bulkInsert(
        'General_Store_Categories',
        [
          {
            name: 'Medical Supplies',
            description: 'General medical supplies and consumables',
            parent_id: null,
            is_active: true,
            created_by: 1, // Assuming staff ID 1 exists
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Equipment',
            description: 'Medical equipment and devices',
            parent_id: null,
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Consumables',
            description: 'General consumable items',
            parent_id: null,
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Furniture',
            description: 'Hospital furniture and fixtures',
            parent_id: null,
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Electronics',
            description: 'Electronic devices and accessories',
            parent_id: null,
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Maintenance',
            description: 'Maintenance tools and supplies',
            parent_id: null,
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        {
          returning: true,
          transaction,
        }
      );

      // Step 2: Insert subcategories
      await queryInterface.bulkInsert(
        'General_Store_Subcategories',
        [
          // Medical Supplies subcategories
          {
            name: 'Bandages and Dressings',
            category_id: categories[0].id,
            description: 'Various types of bandages, gauze, and wound dressings',
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Surgical Instruments',
            category_id: categories[0].id,
            description: 'Basic surgical instruments and tools',
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Syringes and Needles',
            category_id: categories[0].id,
            description: 'Disposable syringes and needles',
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Gloves and Masks',
            category_id: categories[0].id,
            description: 'Disposable gloves, masks, and protective equipment',
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Catheters and Tubes',
            category_id: categories[0].id,
            description: 'Various types of catheters and medical tubes',
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },

          // Equipment subcategories
          {
            name: 'Monitoring Equipment',
            category_id: categories[1].id,
            description: 'Patient monitoring devices and equipment',
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Diagnostic Equipment',
            category_id: categories[1].id,
            description: 'Diagnostic tools and equipment',
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Treatment Equipment',
            category_id: categories[1].id,
            description: 'Treatment and therapy equipment',
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },

          // Consumables subcategories
          {
            name: 'Paper Products',
            category_id: categories[2].id,
            description: 'Paper, forms, and printed materials',
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Cleaning Supplies',
            category_id: categories[2].id,
            description: 'Cleaning and sanitization supplies',
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Office Supplies',
            category_id: categories[2].id,
            description: 'General office supplies and stationery',
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },

          // Furniture subcategories
          {
            name: 'Beds and Mattresses',
            category_id: categories[3].id,
            description: 'Hospital beds, mattresses, and bedding',
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Chairs and Tables',
            category_id: categories[3].id,
            description: 'Chairs, tables, and seating furniture',
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Cabinets and Storage',
            category_id: categories[3].id,
            description: 'Storage cabinets, shelves, and organizers',
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },

          // Electronics subcategories
          {
            name: 'Computers and Accessories',
            category_id: categories[4].id,
            description: 'Computers, laptops, and related accessories',
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Communication Devices',
            category_id: categories[4].id,
            description: 'Phones, radios, and communication equipment',
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Medical Electronics',
            category_id: categories[4].id,
            description: 'Electronic medical devices and accessories',
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },

          // Maintenance subcategories
          {
            name: 'Tools and Equipment',
            category_id: categories[5].id,
            description: 'Hand tools and maintenance equipment',
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Spare Parts',
            category_id: categories[5].id,
            description: 'Spare parts for equipment and machinery',
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Building Materials',
            category_id: categories[5].id,
            description: 'Construction and building maintenance materials',
            is_active: true,
            created_by: 1,
            updated_by: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        {
          transaction,
        }
      );

      await transaction.commit();
      console.log('General Store categories and subcategories seeded successfully!');
    } catch (error) {
      await transaction.rollback();
      console.error('Error seeding General Store categories:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      console.log('Rolling back General Store categories and subcategories...');

      // Remove data in reverse order
      await queryInterface.bulkDelete('General_Store_Request_Items', null, { transaction });
      await queryInterface.bulkDelete('General_Store_Requests', null, { transaction });
      await queryInterface.bulkDelete('General_Store_Movements', null, { transaction });
      await queryInterface.bulkDelete('General_Store_Items', null, { transaction });
      await queryInterface.bulkDelete('General_Store_Subcategories', null, { transaction });
      await queryInterface.bulkDelete('General_Store_Categories', null, { transaction });

      await transaction.commit();
      console.log('General Store categories and subcategories rolled back successfully!');
    } catch (error) {
      await transaction.rollback();
      console.error('Error rolling back General Store categories:', error);
      throw error;
    }
  },
};
