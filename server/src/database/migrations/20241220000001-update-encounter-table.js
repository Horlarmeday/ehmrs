module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      // Add encounter_type enum column
      queryInterface.addColumn('Encounters', 'encounter_type', {
        type: Sequelize.ENUM(
          'Consultation',
          'Prescription',
          'Lab Order',
          'Radiology Order',
          'Service Order',
          'Triage',
          'Observation',
          'Diagnosis',
          'Admission',
          'Discharge',
          'Ward Round',
          'Clinical Note',
          'Multiple'
        ),
        allowNull: true,
      }),

      // Add encounter_summary column
      queryInterface.addColumn('Encounters', 'encounter_summary', {
        type: Sequelize.TEXT,
        allowNull: true,
      }),

      // Add related_entity_type column
      queryInterface.addColumn('Encounters', 'related_entity_type', {
        type: Sequelize.STRING,
        allowNull: true,
      }),

      // Add related_entity_id column
      queryInterface.addColumn('Encounters', 'related_entity_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),

      // Add metadata column
      queryInterface.addColumn('Encounters', 'metadata', {
        type: Sequelize.JSON,
        allowNull: true,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      // Remove the columns in reverse order
      queryInterface.removeColumn('Encounters', 'metadata'),
      queryInterface.removeColumn('Encounters', 'related_entity_id'),
      queryInterface.removeColumn('Encounters', 'related_entity_type'),
      queryInterface.removeColumn('Encounters', 'encounter_summary'),
      queryInterface.removeColumn('Encounters', 'encounter_type'),
    ]);
  },
};
