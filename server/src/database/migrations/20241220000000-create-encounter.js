module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Encounters', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      staff_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Staff',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      visit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Visits',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Patients',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      time_of_encounter: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      encounter_type: {
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
          'Clinical Note'
        ),
        allowNull: true,
      },
      encounter_summary: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      related_entity_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      related_entity_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Encounters');
  },
}; 