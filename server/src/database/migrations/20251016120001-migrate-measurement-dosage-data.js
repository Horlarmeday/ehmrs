module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Migrate existing measurement-dosage relationships to junction table
    return queryInterface.sequelize.query(`
      INSERT INTO Measurement_Dosage_Forms (measurement_id, dosage_form_id, createdAt, updatedAt)
      SELECT id, dosage_form_id, createdAt, updatedAt 
      FROM Measurements 
      WHERE dosage_form_id IS NOT NULL;
    `);
  },
  down: async (queryInterface, Sequelize) => {
    // Remove all records from junction table
    return queryInterface.sequelize.query(`
      DELETE FROM Measurement_Dosage_Forms;
    `);
  },
};
