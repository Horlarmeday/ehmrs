'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add quantity_administered column to Prescribed_Drugs table
    await queryInterface.addColumn('Prescribed_Drugs', 'quantity_administered', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    // Optionally, calculate initial quantity_administered from existing PatientTreatment records
    // This is a one-time calculation for existing data
    // Note: This requires extracting quantities from dosage_administered text fields
    // For now, we'll set it to 0 and let the system track new administrations
    // If you want to backfill from existing treatments, you would need to:
    // 1. Query all PatientTreatment records
    // 2. Extract quantities from dosage_administered text
    // 3. Sum them per drug_id
    // 4. Update Prescribed_Drugs.quantity_administered
  },

  down: async (queryInterface, Sequelize) => {
    // Remove quantity_administered column from Prescribed_Drugs table
    await queryInterface.removeColumn('Prescribed_Drugs', 'quantity_administered');
  },
};

