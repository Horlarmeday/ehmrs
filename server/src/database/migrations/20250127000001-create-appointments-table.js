module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('Appointments', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
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
        doctor_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Staff',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        appointment_date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        appointment_time: {
          type: Sequelize.TIME,
          allowNull: false,
        },
        duration_minutes: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 30,
        },
        type: {
          type: Sequelize.ENUM(
            'Consultation',
            'Follow Up',
            'Procedure',
            'Vaccination',
            'Dialysis',
            'Antenatal'
          ),
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM(
            'Scheduled',
            'Confirmed',
            'Cancelled',
            'Completed',
            'No Show',
            'Rescheduled'
          ),
          allowNull: false,
          defaultValue: 'Scheduled',
        },
        department: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        professional: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        priority: {
          type: Sequelize.STRING,
        },
        notes: {
          type: Sequelize.TEXT,
        },
        reason_for_visit: {
          type: Sequelize.STRING,
        },
        scheduled_by: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Staff',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        visit_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Visits',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        cancelled_at: {
          type: Sequelize.DATE,
        },
        cancelled_by: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Staff',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        cancellation_reason: {
          type: Sequelize.TEXT,
        },
        rescheduled_at: {
          type: Sequelize.DATE,
        },
        rescheduled_by: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Staff',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        rescheduling_reason: {
          type: Sequelize.TEXT,
        },
        confirmed_at: {
          type: Sequelize.DATE,
        },
        confirmed_by: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Staff',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      })
      .then(() => {
        // Add indexes for performance
        return Promise.all([
          queryInterface.addIndex('Appointments', ['appointment_date']),
          queryInterface.addIndex('Appointments', ['doctor_id']),
          queryInterface.addIndex('Appointments', ['patient_id']),
          queryInterface.addIndex('Appointments', ['status']),
          queryInterface.addIndex('Appointments', ['appointment_date', 'doctor_id']),
          queryInterface.addIndex('Appointments', ['appointment_date', 'status']),
        ]);
      });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Appointments');
  },
};
