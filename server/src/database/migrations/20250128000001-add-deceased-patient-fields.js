module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .addColumn('Patients', 'date_of_death', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date when the patient passed away',
      })
      .then(() => {
        return queryInterface.addColumn('Patients', 'cause_of_death', {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Cause of death (optional)',
        });
      })
      .then(() => {
        return queryInterface.addColumn('Patients', 'death_certificate_number', {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Death certificate number (optional)',
        });
      })
      .then(() => {
        return queryInterface.addColumn('Patients', 'marked_deceased_by', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Staff',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          comment: 'Staff member who marked the patient as deceased',
        });
      })
      .then(() => {
        return queryInterface.addColumn('Patients', 'marked_deceased_at', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Timestamp when patient was marked as deceased',
        });
      })
      .then(() => {
        return queryInterface.addColumn('Patients', 'revival_reason', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Reason for reviving patient (admin only)',
        });
      })
      .then(() => {
        return queryInterface.addColumn('Patients', 'revived_by', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Staff',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          comment: 'Staff member who revived the patient',
        });
      })
      .then(() => {
        return queryInterface.addColumn('Patients', 'revived_at', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Timestamp when patient was revived',
        });
      })
      .then(() => {
        // Add indexes for deceased patient queries
        return Promise.all([
          queryInterface.addIndex('Patients', ['patient_status']),
          queryInterface.addIndex('Patients', ['date_of_death']),
          queryInterface.addIndex('Patients', ['marked_deceased_by']),
          queryInterface.addIndex('Patients', ['patient_status', 'date_of_death']),
        ]);
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface
      .removeColumn('Patients', 'date_of_death')
      .then(() => {
        return queryInterface.removeColumn('Patients', 'cause_of_death');
      })
      .then(() => {
        return queryInterface.removeColumn('Patients', 'death_certificate_number');
      })
      .then(() => {
        return queryInterface.removeColumn('Patients', 'marked_deceased_by');
      })
      .then(() => {
        return queryInterface.removeColumn('Patients', 'marked_deceased_at');
      })
      .then(() => {
        return queryInterface.removeColumn('Patients', 'revival_reason');
      })
      .then(() => {
        return queryInterface.removeColumn('Patients', 'revived_by');
      })
      .then(() => {
        return queryInterface.removeColumn('Patients', 'revived_at');
      });
  },
};
