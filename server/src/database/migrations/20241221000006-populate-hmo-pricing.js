'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('Starting HMO pricing population...');

      // Step 1: Get all active drugs
      const drugs = await queryInterface.sequelize.query(
        'SELECT id, name FROM Drugs WHERE status = "Active"',
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      // Step 2: Get all active insurance types
      const insurances = await queryInterface.sequelize.query(
        'SELECT id, name FROM Insurances WHERE status = "Active"',
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      // Step 3: Get all active tests
      const tests = await queryInterface.sequelize.query(
        'SELECT id, name FROM Tests WHERE status = "Active"',
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      // Step 4: Get all active services
      const services = await queryInterface.sequelize.query(
        'SELECT id, name FROM Services WHERE status = "Active"',
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      // Step 5: Get all active investigations
      const investigations = await queryInterface.sequelize.query(
        'SELECT id, name FROM Investigations WHERE status = "Active"',
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      console.log(
        `Found ${drugs.length} drugs, ${insurances.length} insurances, ${tests.length} tests, ${services.length} services, ${investigations.length} investigations`
      );

      // Step 6: Populate HMO Drug Pricing
      const hmoDrugPricingData = [];
      const effectiveFrom = new Date();
      const effectiveTo = new Date();
      effectiveTo.setFullYear(effectiveTo.getFullYear() + 10); // 10 years from now

      for (const drug of drugs) {
        for (const insurance of insurances) {
          let patientPercentage = 10.0; // Default 10% for NHIS
          let hmoPercentage = 90.0; // Default 90% for HMO

          // Adjust percentages based on insurance type
          if (insurance.name.toLowerCase().includes('nhis')) {
            patientPercentage = 10.0;
            hmoPercentage = 90.0;
          } else if (insurance.name.toLowerCase().includes('private')) {
            patientPercentage = 20.0;
            hmoPercentage = 80.0;
          } else if (insurance.name.toLowerCase().includes('fhss')) {
            patientPercentage = 15.0;
            hmoPercentage = 85.0;
          } else {
            // Default for other insurance types
            patientPercentage = 25.0;
            hmoPercentage = 75.0;
          }

          // Get base price from PharmacyStore (use average if multiple entries)
          const basePriceResult = await queryInterface.sequelize.query(
            'SELECT AVG(selling_price) as avg_price FROM Pharmacy_Store_Items WHERE drug_id = ? AND status = "Active"',
            {
              replacements: [drug.id],
              type: Sequelize.QueryTypes.SELECT,
              transaction,
            }
          );

          const basePrice = basePriceResult[0]?.avg_price || 1000.0; // Default price if none found
          const hmoPrice = basePrice; // HMO pays the base price

          hmoDrugPricingData.push({
            drug_id: drug.id,
            insurance_id: insurance.id,
            hmo_price: hmoPrice,
            patient_percentage: patientPercentage,
            hmo_percentage: hmoPercentage,
            effective_from: effectiveFrom,
            effective_to: effectiveTo,
            status: 'Active',
            notes: `Auto-generated pricing for ${drug.name} under ${insurance.name}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      if (hmoDrugPricingData.length > 0) {
        await queryInterface.bulkInsert('HMO_Drug_Pricing', hmoDrugPricingData, { transaction });
        console.log(`Inserted ${hmoDrugPricingData.length} HMO drug pricing records`);
      }

      // Step 7: Populate HMO Test Pricing
      const hmoTestPricingData = [];

      for (const test of tests) {
        for (const insurance of insurances) {
          let patientPercentage = 10.0;
          let hmoPercentage = 90.0;

          if (insurance.name.toLowerCase().includes('nhis')) {
            patientPercentage = 10.0;
            hmoPercentage = 90.0;
          } else if (insurance.name.toLowerCase().includes('private')) {
            patientPercentage = 20.0;
            hmoPercentage = 80.0;
          } else if (insurance.name.toLowerCase().includes('fhss')) {
            patientPercentage = 15.0;
            hmoPercentage = 85.0;
          } else {
            patientPercentage = 25.0;
            hmoPercentage = 75.0;
          }

          // Get base price from test tariffs if available
          const basePriceResult = await queryInterface.sequelize.query(
            'SELECT price FROM Test_Tariffs WHERE test_id = ? AND status = "Active" LIMIT 1',
            {
              replacements: [test.id],
              type: Sequelize.QueryTypes.SELECT,
              transaction,
            }
          );

          const basePrice = basePriceResult[0]?.price || 5000.0; // Default test price
          const hmoPrice = basePrice;

          hmoTestPricingData.push({
            test_id: test.id,
            insurance_id: insurance.id,
            hmo_price: hmoPrice,
            patient_percentage: patientPercentage,
            hmo_percentage: hmoPercentage,
            effective_from: effectiveFrom,
            effective_to: effectiveTo,
            status: 'Active',
            notes: `Auto-generated pricing for ${test.name} under ${insurance.name}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      if (hmoTestPricingData.length > 0) {
        await queryInterface.bulkInsert('HMO_Test_Pricing', hmoTestPricingData, { transaction });
        console.log(`Inserted ${hmoTestPricingData.length} HMO test pricing records`);
      }

      // Step 8: Populate HMO Service Pricing
      const hmoServicePricingData = [];

      for (const service of services) {
        for (const insurance of insurances) {
          let patientPercentage = 10.0;
          let hmoPercentage = 90.0;

          if (insurance.name.toLowerCase().includes('nhis')) {
            patientPercentage = 10.0;
            hmoPercentage = 90.0;
          } else if (insurance.name.toLowerCase().includes('private')) {
            patientPercentage = 20.0;
            hmoPercentage = 80.0;
          } else if (insurance.name.toLowerCase().includes('fhss')) {
            patientPercentage = 15.0;
            hmoPercentage = 85.0;
          } else {
            patientPercentage = 25.0;
            hmoPercentage = 75.0;
          }

          // Get base price from service tariffs if available
          const basePriceResult = await queryInterface.sequelize.query(
            'SELECT price FROM Service_Tariffs WHERE service_id = ? AND status = "Active" LIMIT 1',
            {
              replacements: [service.id],
              type: Sequelize.QueryTypes.SELECT,
              transaction,
            }
          );

          const basePrice = basePriceResult[0]?.price || 3000.0; // Default service price
          const hmoPrice = basePrice;

          hmoServicePricingData.push({
            service_id: service.id,
            insurance_id: insurance.id,
            hmo_price: hmoPrice,
            patient_percentage: patientPercentage,
            hmo_percentage: hmoPercentage,
            effective_from: effectiveFrom,
            effective_to: effectiveTo,
            status: 'Active',
            notes: `Auto-generated pricing for ${service.name} under ${insurance.name}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      if (hmoServicePricingData.length > 0) {
        await queryInterface.bulkInsert('HMO_Service_Pricing', hmoServicePricingData, {
          transaction,
        });
        console.log(`Inserted ${hmoServicePricingData.length} HMO service pricing records`);
      }

      // Step 9: Populate HMO Investigation Pricing
      const hmoInvestigationPricingData = [];

      for (const investigation of investigations) {
        for (const insurance of insurances) {
          let patientPercentage = 10.0;
          let hmoPercentage = 90.0;

          if (insurance.name.toLowerCase().includes('nhis')) {
            patientPercentage = 10.0;
            hmoPercentage = 90.0;
          } else if (insurance.name.toLowerCase().includes('private')) {
            patientPercentage = 20.0;
            hmoPercentage = 80.0;
          } else if (insurance.name.toLowerCase().includes('fhss')) {
            patientPercentage = 15.0;
            hmoPercentage = 85.0;
          } else {
            patientPercentage = 25.0;
            hmoPercentage = 75.0;
          }

          // Get base price from investigation tariffs if available
          const basePriceResult = await queryInterface.sequelize.query(
            'SELECT price FROM Investigation_Tariffs WHERE investigation_id = ? AND status = "Active" LIMIT 1',
            {
              replacements: [investigation.id],
              type: Sequelize.QueryTypes.SELECT,
              transaction,
            }
          );

          const basePrice = basePriceResult[0]?.price || 8000.0; // Default investigation price
          const hmoPrice = basePrice;

          hmoInvestigationPricingData.push({
            investigation_id: investigation.id,
            insurance_id: insurance.id,
            hmo_price: hmoPrice,
            patient_percentage: patientPercentage,
            hmo_percentage: hmoPercentage,
            effective_from: effectiveFrom,
            effective_to: effectiveTo,
            status: 'Active',
            notes: `Auto-generated pricing for ${investigation.name} under ${insurance.name}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      if (hmoInvestigationPricingData.length > 0) {
        await queryInterface.bulkInsert('HMO_Investigation_Pricing', hmoInvestigationPricingData, {
          transaction,
        });
        console.log(
          `Inserted ${hmoInvestigationPricingData.length} HMO investigation pricing records`
        );
      }

      await transaction.commit();
      console.log('HMO pricing population completed successfully!');
    } catch (error) {
      await transaction.rollback();
      console.error('Error during HMO pricing population:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Remove all HMO pricing data
      await queryInterface.bulkDelete('HMO_Investigation_Pricing', {}, { transaction });
      await queryInterface.bulkDelete('HMO_Service_Pricing', {}, { transaction });
      await queryInterface.bulkDelete('HMO_Test_Pricing', {}, { transaction });
      await queryInterface.bulkDelete('HMO_Drug_Pricing', {}, { transaction });

      await transaction.commit();
      console.log('HMO pricing data removed successfully!');
    } catch (error) {
      await transaction.rollback();
      console.error('Error during HMO pricing rollback:', error);
      throw error;
    }
  },
};
