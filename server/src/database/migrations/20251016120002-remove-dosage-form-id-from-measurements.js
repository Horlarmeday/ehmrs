module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, verify that all data has been migrated
    const [measurements] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) as count 
      FROM Measurements 
      WHERE dosage_form_id IS NOT NULL;
    `);

    const [junctionRecords] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) as count 
      FROM Measurement_Dosage_Forms;
    `);

    console.log(`Measurements with dosage_form_id: ${measurements[0].count}`);
    console.log(`Junction table records: ${junctionRecords[0].count}`);

    if (measurements[0].count !== junctionRecords[0].count) {
      throw new Error(
        'Data migration verification failed. Junction table record count does not match.'
      );
    }

    // Remove the foreign key constraint first
    return queryInterface.sequelize
      .query(
        `
      ALTER TABLE Measurements 
      DROP FOREIGN KEY IF EXISTS Measurements_ibfk_1;
    `
      )
      .then(() => {
        // Remove the index
        return queryInterface.sequelize.query(`
        ALTER TABLE Measurements 
        DROP INDEX IF EXISTS dosage_form_id;
      `);
      })
      .then(() => {
        // Remove the column
        return queryInterface.removeColumn('Measurements', 'dosage_form_id');
      });
  },
  down: async (queryInterface, Sequelize) => {
    // Add back the dosage_form_id column
    return queryInterface
      .addColumn('Measurements', 'dosage_form_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Dosage_Forms',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      })
      .then(() => {
        // Restore data from junction table (only first association for each measurement)
        return queryInterface.sequelize.query(`
        UPDATE Measurements m
        INNER JOIN (
          SELECT measurement_id, MIN(dosage_form_id) as dosage_form_id
          FROM Measurement_Dosage_Forms
          GROUP BY measurement_id
        ) mdf ON m.id = mdf.measurement_id
        SET m.dosage_form_id = mdf.dosage_form_id;
      `);
      });
  },
};
