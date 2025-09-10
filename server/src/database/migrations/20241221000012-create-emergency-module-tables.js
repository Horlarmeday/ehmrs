'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      console.log('Creating Emergency module tables with proper ward relationships...');

      // Step 1: Create Emergency_Visits table
      console.log('Creating Emergency_Visits table...');
      await queryInterface.createTable(
        'Emergency_Visits',
        {
          id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
          patient_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'patients', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          visit_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'visits', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          attending_physician_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'staffs', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          triage_nurse_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'staffs', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          emergency_nurse_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'staffs', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          emergency_type: {
            type: Sequelize.ENUM(
              'TRAUMA',
              'MEDICAL',
              'SURGICAL',
              'OBSTETRIC',
              'PEDIATRIC',
              'PSYCHIATRIC',
              'CARDIAC',
              'RESPIRATORY',
              'NEUROLOGICAL'
            ),
            allowNull: false,
          },
          status: {
            type: Sequelize.ENUM(
              'TRIAGE',
              'ASSESSMENT',
              'TREATMENT',
              'OBSERVATION',
              'DISCHARGED',
              'ADMITTED',
              'TRANSFERRED',
              'DECEASED'
            ),
            allowNull: false,
            defaultValue: 'TRIAGE',
          },
          triage_category: {
            type: Sequelize.ENUM('IMMEDIATE', 'EMERGENT', 'URGENT', 'LESS_URGENT', 'NON_URGENT'),
            allowNull: false,
          },
          priority_score: { type: Sequelize.INTEGER, allowNull: false },
          arrival_time: { type: Sequelize.DATE, allowNull: false },
          triage_completed_time: { type: Sequelize.DATE, allowNull: true },
          assessment_started_time: { type: Sequelize.DATE, allowNull: true },
          treatment_started_time: { type: Sequelize.DATE, allowNull: true },
          disposition_time: { type: Sequelize.DATE, allowNull: true },
          chief_complaint: { type: Sequelize.STRING, allowNull: false },
          presenting_symptoms: { type: Sequelize.TEXT, allowNull: true },
          vital_signs: { type: Sequelize.TEXT, allowNull: true },
          allergies: { type: Sequelize.TEXT, allowNull: true },
          current_medications: { type: Sequelize.TEXT, allowNull: true },
          past_medical_history: { type: Sequelize.TEXT, allowNull: true },
          social_history: { type: Sequelize.TEXT, allowNull: true },
          mode_of_arrival: { type: Sequelize.STRING, allowNull: true },
          accompanying_person: { type: Sequelize.STRING, allowNull: true },
          contact_phone: { type: Sequelize.STRING, allowNull: true },
          notes: { type: Sequelize.TEXT, allowNull: true },
          total_cost: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
          is_insured: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          insurance_id: { type: Sequelize.INTEGER, allowNull: true },
          insurance_number: { type: Sequelize.STRING, allowNull: true },
          createdAt: { type: Sequelize.DATE, allowNull: false },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
        },
        { transaction }
      );

      // Step 2: Create Emergency_Beds table
      console.log('Creating Emergency_Beds table...');
      await queryInterface.createTable(
        'Emergency_Beds',
        {
          id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
          bed_number: { type: Sequelize.STRING, allowNull: false, unique: true },
          bed_type: {
            type: Sequelize.ENUM(
              'RESUSCITATION',
              'MONITORING',
              'OBSERVATION',
              'ISOLATION',
              'PEDIATRIC',
              'OBSTETRIC',
              'PSYCHIATRIC',
              'TRAUMA'
            ),
            allowNull: false,
          },
          status: {
            type: Sequelize.ENUM(
              'AVAILABLE',
              'OCCUPIED',
              'RESERVED',
              'MAINTENANCE',
              'OUT_OF_SERVICE'
            ),
            allowNull: false,
            defaultValue: 'AVAILABLE',
          },
          ward_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'wards', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          zone: { type: Sequelize.STRING, allowNull: false },
          room_number: { type: Sequelize.STRING, allowNull: true },
          description: { type: Sequelize.STRING, allowNull: true },
          has_monitoring: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          has_ventilator: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          has_defibrillator: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          has_suction: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          has_oxygen: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          equipment_notes: { type: Sequelize.TEXT, allowNull: true },
          hourly_rate: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
          notes: { type: Sequelize.TEXT, allowNull: true },
          current_emergency_visit_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'Emergency_Visits', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          assigned_nurse_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'staffs', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          assigned_time: { type: Sequelize.DATE, allowNull: true },
          expected_discharge_time: { type: Sequelize.DATE, allowNull: true },
          createdAt: { type: Sequelize.DATE, allowNull: false },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
        },
        { transaction }
      );

      // Step 3: Create Emergency_Triages table
      console.log('Creating Emergency_Triages table...');
      await queryInterface.createTable(
        'Emergency_Triages',
        {
          id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
          emergency_visit_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'Emergency_Visits', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          triage_nurse_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'staffs', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          status: {
            type: Sequelize.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED'),
            allowNull: false,
            defaultValue: 'PENDING',
          },
          bp_systolic: { type: Sequelize.INTEGER, allowNull: true },
          bp_diastolic: { type: Sequelize.INTEGER, allowNull: true },
          pulse_rate: { type: Sequelize.INTEGER, allowNull: true },
          temperature: { type: Sequelize.DECIMAL(4, 1), allowNull: true },
          respiratory_rate: { type: Sequelize.INTEGER, allowNull: true },
          oxygen_saturation: { type: Sequelize.INTEGER, allowNull: true },
          pain_score: { type: Sequelize.INTEGER, allowNull: true },
          glasgow_coma_scale: { type: Sequelize.INTEGER, allowNull: true },
          chief_complaint: { type: Sequelize.TEXT, allowNull: true },
          symptoms: { type: Sequelize.TEXT, allowNull: true },
          medical_history: { type: Sequelize.TEXT, allowNull: true },
          triage_decision: { type: Sequelize.TEXT, allowNull: true },
          triage_completed_time: { type: Sequelize.DATE, allowNull: true },
          notes: { type: Sequelize.TEXT, allowNull: true },
          createdAt: { type: Sequelize.DATE, allowNull: false },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
        },
        { transaction }
      );

      // Step 4: Create Emergency_Procedures table
      console.log('Creating Emergency_Procedures table...');
      await queryInterface.createTable(
        'Emergency_Procedures',
        {
          id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
          emergency_visit_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'Emergency_Visits', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          performing_doctor_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'staffs', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          procedure_name: { type: Sequelize.STRING, allowNull: false },
          procedure_type: {
            type: Sequelize.ENUM('DIAGNOSTIC', 'THERAPEUTIC', 'EMERGENCY', 'MINOR_SURGERY'),
            allowNull: false,
          },
          status: {
            type: Sequelize.ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
            allowNull: false,
            defaultValue: 'PLANNED',
          },
          description: { type: Sequelize.TEXT, allowNull: true },
          indications: { type: Sequelize.TEXT, allowNull: true },
          contraindications: { type: Sequelize.TEXT, allowNull: true },
          complications: { type: Sequelize.TEXT, allowNull: true },
          planned_time: { type: Sequelize.DATE, allowNull: true },
          started_time: { type: Sequelize.DATE, allowNull: true },
          completed_time: { type: Sequelize.DATE, allowNull: true },
          duration_minutes: { type: Sequelize.INTEGER, allowNull: true },
          notes: { type: Sequelize.TEXT, allowNull: true },
          cost: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
          createdAt: { type: Sequelize.DATE, allowNull: false },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
        },
        { transaction }
      );

      // Step 5: Add indexes for performance
      console.log('Adding indexes for performance...');

      // Emergency_Visits indexes
      await queryInterface.addIndex('Emergency_Visits', ['patient_id'], {
        name: 'idx_emergency_visit_patient',
        transaction,
      });
      await queryInterface.addIndex('Emergency_Visits', ['status'], {
        name: 'idx_emergency_visit_status',
        transaction,
      });
      await queryInterface.addIndex('Emergency_Visits', ['emergency_type'], {
        name: 'idx_emergency_visit_type',
        transaction,
      });
      await queryInterface.addIndex('Emergency_Visits', ['triage_category'], {
        name: 'idx_emergency_visit_triage',
        transaction,
      });
      await queryInterface.addIndex('Emergency_Visits', ['arrival_time'], {
        name: 'idx_emergency_visit_arrival',
        transaction,
      });
      await queryInterface.addIndex('Emergency_Visits', ['priority_score'], {
        name: 'idx_emergency_visit_priority',
        transaction,
      });
      await queryInterface.addIndex(
        'Emergency_Visits',
        ['status', 'triage_category', 'arrival_time'],
        { name: 'idx_emergency_visit_composite', transaction }
      );

      // Emergency_Beds indexes
      await queryInterface.addIndex('Emergency_Beds', ['bed_number'], {
        name: 'idx_emergency_bed_number',
        transaction,
      });
      await queryInterface.addIndex('Emergency_Beds', ['bed_type'], {
        name: 'idx_emergency_bed_type',
        transaction,
      });
      await queryInterface.addIndex('Emergency_Beds', ['status'], {
        name: 'idx_emergency_bed_status',
        transaction,
      });
      await queryInterface.addIndex('Emergency_Beds', ['ward_id'], {
        name: 'idx_emergency_bed_ward',
        transaction,
      });
      await queryInterface.addIndex('Emergency_Beds', ['zone'], {
        name: 'idx_emergency_bed_zone',
        transaction,
      });
      await queryInterface.addIndex('Emergency_Beds', ['status', 'bed_type', 'zone'], {
        name: 'idx_emergency_bed_composite',
        transaction,
      });

      // Emergency_Triages indexes
      await queryInterface.addIndex('Emergency_Triages', ['emergency_visit_id'], {
        name: 'idx_emergency_triage_visit',
        transaction,
      });
      await queryInterface.addIndex('Emergency_Triages', ['triage_nurse_id'], {
        name: 'idx_emergency_triage_nurse',
        transaction,
      });
      await queryInterface.addIndex('Emergency_Triages', ['status'], {
        name: 'idx_emergency_triage_status',
        transaction,
      });

      // Emergency_Procedures indexes
      await queryInterface.addIndex('Emergency_Procedures', ['emergency_visit_id'], {
        name: 'idx_emergency_procedure_visit',
        transaction,
      });
      await queryInterface.addIndex('Emergency_Procedures', ['performing_doctor_id'], {
        name: 'idx_emergency_procedure_doctor',
        transaction,
      });
      await queryInterface.addIndex('Emergency_Procedures', ['status'], {
        name: 'idx_emergency_procedure_status',
        transaction,
      });
      await queryInterface.addIndex('Emergency_Procedures', ['procedure_type'], {
        name: 'idx_emergency_procedure_type',
        transaction,
      });

      await transaction.commit();
      console.log('Successfully created Emergency module tables with proper ward relationships!');
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating Emergency module tables:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      console.log('Dropping Emergency module tables...');

      // Drop tables in reverse order (due to foreign key constraints)
      await queryInterface.dropTable('Emergency_Procedures', { transaction });
      await queryInterface.dropTable('Emergency_Triages', { transaction });
      await queryInterface.dropTable('Emergency_Beds', { transaction });
      await queryInterface.dropTable('Emergency_Visits', { transaction });

      await transaction.commit();
      console.log('Successfully dropped Emergency module tables!');
    } catch (error) {
      await transaction.rollback();
      console.error('Error dropping Emergency module tables:', error);
      throw error;
    }
  },
};
