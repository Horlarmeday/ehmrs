'use strict';

module.exports = {
  up: async queryInterface => {
    const [duplicates] = await queryInterface.sequelize.query(`
      SELECT patient_id
      FROM patient_deposits
      WHERE status = 'ACTIVE'
      GROUP BY patient_id
      HAVING COUNT(*) > 1
    `);

    if (duplicates.length > 0) {
      const duplicateIds = duplicates.map(row => row.patient_id).join(', ');
      throw new Error(
        `Cannot enforce single active deposit constraint. Resolve duplicate active deposits for patient IDs: ${duplicateIds}`
      );
    }

    await queryInterface.sequelize.query(`
      ALTER TABLE patient_deposits
      ADD COLUMN active_patient_id INT GENERATED ALWAYS AS (
        CASE WHEN status = 'ACTIVE' THEN patient_id ELSE NULL END
      ) STORED
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX uq_patient_deposits_active_patient
      ON patient_deposits (active_patient_id)
    `);
  },

  down: async queryInterface => {
    await queryInterface.sequelize.query(`
      DROP INDEX uq_patient_deposits_active_patient ON patient_deposits
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE patient_deposits
      DROP COLUMN active_patient_id
    `);
  },
};

