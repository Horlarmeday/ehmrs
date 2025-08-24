'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('Starting PharmacyStore data consolidation...');
      
      // Step 1: Create temporary table to store consolidated data
      await queryInterface.createTable('Pharmacy_Store_Consolidated', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        drug_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        shelf: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        product_code: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        batch: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        voucher: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        quantity_received: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        quantity_remaining: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        unit_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        unit_price: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: false,
        },
        selling_price: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: false,
        },
        total_price: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: false,
        },
        expiration: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        dosage_form_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        staff_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        date_received: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        measurement_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        strength_input: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        route_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        drug_form: {
          type: Sequelize.ENUM('Drug', 'Consumable'),
          allowNull: false,
        },
        brand: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        vendor_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        procurement_order_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        old_ids: {
          type: Sequelize.TEXT, // JSON array of old IDs for reference
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
      }, { transaction });

      // Step 2: Insert consolidated data
      const consolidationQuery = `
        INSERT INTO Pharmacy_Store_Consolidated (
          drug_id, shelf, product_code, batch, voucher, quantity_received, quantity_remaining,
          unit_id, unit_price, selling_price, total_price, expiration, dosage_form_id,
          staff_id, date_received, measurement_id, strength_input, route_id, drug_form,
          brand, vendor_id, old_ids, createdAt, updatedAt
        )
        SELECT 
          drug_id,
          MAX(shelf) as shelf,
          MAX(product_code) as product_code,
          MAX(batch) as batch,
          MAX(voucher) as voucher,
          SUM(quantity_received) as quantity_received,
          SUM(quantity_remaining) as quantity_remaining,
          MAX(unit_id) as unit_id,
          AVG(unit_price) as unit_price,
          MAX(selling_price) as selling_price,
          SUM(total_price) as total_price,
          MAX(expiration) as expiration,
          MAX(dosage_form_id) as dosage_form_id,
          MAX(staff_id) as staff_id,
          MAX(date_received) as date_received,
          MAX(measurement_id) as measurement_id,
          MAX(strength_input) as strength_input,
          MAX(route_id) as route_id,
          MAX(drug_form) as drug_form,
          MAX(brand) as brand,
          MAX(vendor_id) as vendor_id,
          JSON_ARRAYAGG(id) as old_ids,
          NOW() as createdAt,
          NOW() as updatedAt
        FROM Pharmacy_Store_Items
        WHERE status = 'Active'
        GROUP BY drug_id, unit_id, drug_form
        HAVING COUNT(*) > 1
      `;

      await queryInterface.sequelize.query(consolidationQuery, { transaction });

      // Step 3: Insert non-duplicate items
      const nonDuplicateQuery = `
        INSERT INTO Pharmacy_Store_Consolidated (
          drug_id, shelf, product_code, batch, voucher, quantity_received, quantity_remaining,
          unit_id, unit_price, selling_price, total_price, expiration, dosage_form_id,
          staff_id, date_received, measurement_id, strength_input, route_id, drug_form,
          brand, vendor_id, old_ids, createdAt, updatedAt
        )
        SELECT 
          ps.drug_id,
          ps.shelf,
          ps.product_code,
          ps.batch,
          ps.voucher,
          ps.quantity_received,
          ps.quantity_remaining,
          ps.unit_id,
          ps.unit_price,
          ps.selling_price,
          ps.total_price,
          ps.expiration,
          ps.dosage_form_id,
          ps.staff_id,
          ps.date_received,
          ps.measurement_id,
          ps.strength_input,
          ps.route_id,
          ps.drug_form,
          ps.brand,
          ps.vendor_id,
          JSON_ARRAY(ps.id) as old_ids,
          ps.createdAt,
          ps.updatedAt
        FROM Pharmacy_Store_Items ps
        LEFT JOIN (
          SELECT drug_id, unit_id, drug_form, COUNT(*) as cnt
          FROM Pharmacy_Store_Items
          WHERE status = 'Active'
          GROUP BY drug_id, unit_id, drug_form
          HAVING COUNT(*) > 1
        ) duplicates ON ps.drug_id = duplicates.drug_id 
          AND ps.unit_id = duplicates.unit_id 
          AND ps.drug_form = duplicates.drug_form
        WHERE duplicates.cnt IS NULL 
          AND ps.status = 'Active'
      `;

      await queryInterface.sequelize.query(nonDuplicateQuery, { transaction });

      // Step 4: Update InventoryItem references to point to new consolidated entries
      const updateInventoryQuery = `
        UPDATE Inventory_Items ii
        JOIN Pharmacy_Store_Consolidated psc ON ii.drug_id = psc.drug_id
        SET ii.pharmacy_store_id = psc.id
        WHERE ii.pharmacy_store_id IN (
          SELECT old_id FROM Pharmacy_Store_Consolidated, 
          JSON_TABLE(old_ids, '$[*]' COLUMNS (old_id INT PATH '$')) as jt
        )
      `;

      await queryInterface.sequelize.query(updateInventoryQuery, { transaction });

      // Step 5: Backup old table and rename
      await queryInterface.renameTable('Pharmacy_Store_Items', 'Pharmacy_Store_Items_Old', { transaction });
      await queryInterface.renameTable('Pharmacy_Store_Consolidated', 'Pharmacy_Store_Items', { transaction });

      // Step 6: Add foreign key constraints
      await queryInterface.addConstraint('Pharmacy_Store_Items', {
        fields: ['drug_id'],
        type: 'foreign key',
        name: 'fk_pharmacy_store_drug',
        references: {
          table: 'Drugs',
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      }, { transaction });

      await queryInterface.addConstraint('Pharmacy_Store_Items', {
        fields: ['unit_id'],
        type: 'foreign key',
        name: 'fk_pharmacy_store_unit',
        references: {
          table: 'Units',
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      }, { transaction });

      await queryInterface.addConstraint('Pharmacy_Store_Items', {
        fields: ['staff_id'],
        type: 'foreign key',
        name: 'fk_pharmacy_store_staff',
        references: {
          table: 'Staffs',
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }, { transaction });

      await queryInterface.addConstraint('Pharmacy_Store_Items', {
        fields: ['vendor_id'],
        type: 'foreign key',
        name: 'fk_pharmacy_store_vendor',
        references: {
          table: 'Vendors',
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }, { transaction });

      // Step 7: Add indexes for performance
      await queryInterface.addIndex('Pharmacy_Store_Items', ['drug_id'], { transaction });
      await queryInterface.addIndex('Pharmacy_Store_Items', ['unit_id'], { transaction });
      await queryInterface.addIndex('Pharmacy_Store_Items', ['status'], { transaction });
      await queryInterface.addIndex('Pharmacy_Store_Items', ['expiration'], { transaction });

      await transaction.commit();
      console.log('PharmacyStore data consolidation completed successfully!');
      
    } catch (error) {
      await transaction.rollback();
      console.error('Error during PharmacyStore consolidation:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Restore original table
      await queryInterface.renameTable('Pharmacy_Store_Items', 'Pharmacy_Store_Items_New', { transaction });
      await queryInterface.renameTable('Pharmacy_Store_Items_Old', 'Pharmacy_Store_Items', { transaction });
      
      // Drop temporary table
      await queryInterface.dropTable('Pharmacy_Store_Items_New', { transaction });
      
      await transaction.commit();
      console.log('PharmacyStore consolidation rolled back successfully!');
      
    } catch (error) {
      await transaction.rollback();
      console.error('Error during rollback:', error);
      throw error;
    }
  },
};
