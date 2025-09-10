'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('Starting data integrity validation...');

      // Step 1: Validate PharmacyStore consolidation
      const duplicateCheck = await queryInterface.sequelize.query(
        `SELECT 
          drug_id, 
          unit_id, 
          drug_form, 
          COUNT(*) as count
        FROM Pharmacy_Store_Items 
        WHERE status = 'Active'
        GROUP BY drug_id, unit_id, drug_form
        HAVING COUNT(*) > 1`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      if (duplicateCheck.length > 0) {
        console.warn(`⚠️  Found ${duplicateCheck.length} duplicate entries that need attention:`);
        duplicateCheck.forEach(dup => {
          console.warn(`   Drug ID: ${dup.drug_id}, Unit ID: ${dup.unit_id}, Count: ${dup.count}`);
        });
      } else {
        console.log('✅ No duplicate PharmacyStore entries found');
      }

      // Step 2: Validate HMO pricing coverage
      const hmoDrugCoverage = await queryInterface.sequelize.query(
        `SELECT 
          COUNT(DISTINCT d.id) as total_drugs,
          COUNT(DISTINCT hdp.drug_id) as covered_drugs,
          COUNT(DISTINCT d.id) - COUNT(DISTINCT hdp.drug_id) as uncovered_drugs
        FROM Drugs d
        LEFT JOIN HMO_Drug_Pricing hdp ON d.id = hdp.drug_id AND hdp.status = 'Active'
        WHERE d.status = 'Active'`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      const hmoTestCoverage = await queryInterface.sequelize.query(
        `SELECT 
          COUNT(DISTINCT t.id) as total_tests,
          COUNT(DISTINCT htp.test_id) as covered_tests,
          COUNT(DISTINCT t.id) - COUNT(DISTINCT htp.test_id) as uncovered_tests
        FROM Tests t
        LEFT JOIN HMO_Test_Pricing htp ON t.id = htp.test_id AND htp.status = 'Active'
        WHERE t.status = 'Active'`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      const hmoServiceCoverage = await queryInterface.sequelize.query(
        `SELECT 
          COUNT(DISTINCT s.id) as total_services,
          COUNT(DISTINCT hsp.service_id) as covered_services,
          COUNT(DISTINCT s.id) - COUNT(DISTINCT hsp.service_id) as uncovered_services
        FROM Services s
        LEFT JOIN HMO_Service_Pricing hsp ON s.id = hsp.service_id AND hsp.status = 'Active'
        WHERE s.status = 'Active'`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      const hmoInvestigationCoverage = await queryInterface.sequelize.query(
        `SELECT 
          COUNT(DISTINCT i.id) as total_investigations,
          COUNT(DISTINCT hip.investigation_id) as covered_investigations,
          COUNT(DISTINCT i.id) - COUNT(DISTINCT hip.investigation_id) as uncovered_investigations
        FROM Investigations i
        LEFT JOIN HMO_Investigation_Pricing hip ON i.id = hip.investigation_id AND hip.status = 'Active'
        WHERE i.status = 'Active'`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      console.log('📊 HMO Pricing Coverage Summary:');
      console.log(
        `   Drugs: ${hmoDrugCoverage[0].covered_drugs}/${hmoDrugCoverage[0].total_drugs} covered`
      );
      console.log(
        `   Tests: ${hmoTestCoverage[0].covered_tests}/${hmoTestCoverage[0].total_tests} covered`
      );
      console.log(
        `   Services: ${hmoServiceCoverage[0].covered_services}/${hmoServiceCoverage[0].total_services} covered`
      );
      console.log(
        `   Investigations: ${hmoInvestigationCoverage[0].covered_investigations}/${hmoInvestigationCoverage[0].total_investigations} covered`
      );

      // Step 3: Validate foreign key relationships
      const orphanedInventoryItems = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as count
         FROM Inventory_Items ii
         LEFT JOIN Pharmacy_Store_Items psi ON ii.pharmacy_store_id = psi.id
         WHERE ii.pharmacy_store_id IS NOT NULL AND psi.id IS NULL`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      if (orphanedInventoryItems[0].count > 0) {
        console.warn(`⚠️  Found ${orphanedInventoryItems[0].count} orphaned InventoryItems`);
      } else {
        console.log('✅ All InventoryItems have valid PharmacyStore references');
      }

      // Step 4: Validate insurance coverage
      const insuranceCoverage = await queryInterface.sequelize.query(
        `SELECT 
          i.name as insurance_name,
          COUNT(DISTINCT hdp.drug_id) as drugs_covered,
          COUNT(DISTINCT htp.test_id) as tests_covered,
          COUNT(DISTINCT hsp.service_id) as services_covered,
          COUNT(DISTINCT hip.investigation_id) as investigations_covered
        FROM Insurances i
        LEFT JOIN HMO_Drug_Pricing hdp ON i.id = hdp.insurance_id AND hdp.status = 'Active'
        LEFT JOIN HMO_Test_Pricing htp ON i.id = htp.insurance_id AND htp.status = 'Active'
        LEFT JOIN HMO_Service_Pricing hsp ON i.id = hsp.insurance_id AND hsp.status = 'Active'
        LEFT JOIN HMO_Investigation_Pricing hip ON i.id = hip.insurance_id AND hip.status = 'Active'
        WHERE i.status = 'Active'
        GROUP BY i.id, i.name`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      console.log('🏥 Insurance Coverage Summary:');
      insuranceCoverage.forEach(insurance => {
        console.log(
          `   ${insurance.insurance_name}: ${insurance.drugs_covered} drugs, ${insurance.tests_covered} tests, ${insurance.services_covered} services, ${insurance.investigations_covered} investigations`
        );
      });

      // Step 5: Check for missing procurement_order_id in PharmacyStore
      const missingProcurementOrders = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as count
         FROM Pharmacy_Store_Items
         WHERE procurement_order_id IS NULL`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      console.log(
        `📦 PharmacyStore items without procurement orders: ${missingProcurementOrders[0].count}`
      );

      // Step 6: Generate summary report
      const summary = {
        timestamp: new Date().toISOString(),
        duplicate_entries: duplicateCheck.length,
        hmo_coverage: {
          drugs: hmoDrugCoverage[0],
          tests: hmoTestCoverage[0],
          services: hmoServiceCoverage[0],
          investigations: hmoInvestigationCoverage[0],
        },
        orphaned_items: orphanedInventoryItems[0].count,
        insurance_coverage: insuranceCoverage.length,
        missing_procurement_orders: missingProcurementOrders[0].count,
      };

      console.log('📋 Data Integrity Validation Summary:');
      console.log(JSON.stringify(summary, null, 2));

      // Step 7: Create validation log table
      await queryInterface.createTable(
        'Migration_Validation_Log',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          migration_name: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          validation_summary: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          status: {
            type: Sequelize.ENUM('PASSED', 'WARNING', 'FAILED'),
            defaultValue: 'PASSED',
          },
          details: {
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
        { transaction }
      );

      // Step 8: Log validation results
      const validationStatus =
        duplicateCheck.length === 0 && orphanedInventoryItems[0].count === 0 ? 'PASSED' : 'WARNING';

      await queryInterface.bulkInsert(
        'Migration_Validation_Log',
        [
          {
            migration_name: 'Phase 2 Data Migration',
            validation_summary: JSON.stringify(summary),
            status: validationStatus,
            details: `Validation completed with ${duplicateCheck.length} duplicates and ${orphanedInventoryItems[0].count} orphaned items`,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        { transaction }
      );

      await transaction.commit();
      console.log('✅ Data integrity validation completed successfully!');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error during data integrity validation:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Remove validation log table
      await queryInterface.dropTable('Migration_Validation_Log', { transaction });

      await transaction.commit();
      console.log('Data integrity validation log removed successfully!');
    } catch (error) {
      await transaction.rollback();
      console.error('Error during rollback:', error);
      throw error;
    }
  },
};
