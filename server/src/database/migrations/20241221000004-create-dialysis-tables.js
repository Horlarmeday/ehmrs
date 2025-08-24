'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Dialysis Visits table
    await queryInterface.createTable('Dialysis_Visits', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Patients',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      visit_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Visits',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      doctor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Staffs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      nurse_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Staffs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      dialysis_type: {
        type: Sequelize.ENUM('HEMODIALYSIS', 'PERITONEAL', 'CONTINUOUS', 'INTERMITTENT'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'),
        defaultValue: 'SCHEDULED',
      },
      scheduled_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      scheduled_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      actual_start_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      actual_end_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      planned_duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      actual_duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      clinical_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      nursing_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      patient_payment: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
      },
      hmo_payment: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
      },
      machine_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bed_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_emergency: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      cancellation_reason: {
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
    });

    // Create Dialysis Treatments table
    await queryInterface.createTable('Dialysis_Treatments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      dialysis_visit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Dialysis_Visits',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      nurse_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Staffs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      status: {
        type: Sequelize.ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'INTERRUPTED'),
        defaultValue: 'NOT_STARTED',
      },
      treatment_start_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      treatment_end_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      // Hemodialysis Parameters
      blood_flow_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      dialysate_flow_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      ultrafiltration_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      target_weight_loss: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      actual_weight_loss: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      // Pre-treatment Vital Signs
      pre_bp_systolic: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      pre_bp_diastolic: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      pre_pulse: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      pre_temperature: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      pre_weight: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      // Post-treatment Vital Signs
      post_bp_systolic: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      post_bp_diastolic: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      post_pulse: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      post_temperature: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      post_weight: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      // Treatment Notes
      treatment_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      complications: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      interventions: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      medications_given: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      // Machine Parameters
      machine_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      dialyzer_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      dialysate_concentration: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      dialysate_temperature: {
        type: Sequelize.DECIMAL(5, 2),
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
    });

    // Add indexes for better performance
    await queryInterface.addIndex('Dialysis_Visits', ['patient_id']);
    await queryInterface.addIndex('Dialysis_Visits', ['doctor_id']);
    await queryInterface.addIndex('Dialysis_Visits', ['nurse_id']);
    await queryInterface.addIndex('Dialysis_Visits', ['status']);
    await queryInterface.addIndex('Dialysis_Visits', ['scheduled_date']);
    await queryInterface.addIndex('Dialysis_Visits', ['dialysis_type']);
    await queryInterface.addIndex('Dialysis_Treatments', ['dialysis_visit_id']);
    await queryInterface.addIndex('Dialysis_Treatments', ['nurse_id']);
    await queryInterface.addIndex('Dialysis_Treatments', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Dialysis_Treatments');
    await queryInterface.dropTable('Dialysis_Visits');
  },
};
