module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('Measurement_Dosage_Forms', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        measurement_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Measurements',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        dosage_form_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Dosage_Forms',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
      })
      .then(() => {
        // Add unique constraint to prevent duplicate associations
        return queryInterface.addConstraint('Measurement_Dosage_Forms', {
          fields: ['measurement_id', 'dosage_form_id'],
          type: 'unique',
          name: 'unique_measurement_dosage_form',
        });
      })
      .then(() => {
        // Add indexes for performance
        return queryInterface.addIndex('Measurement_Dosage_Forms', ['measurement_id'], {
          name: 'measurement_dosage_forms_measurement_id_index',
        });
      })
      .then(() => {
        return queryInterface.addIndex('Measurement_Dosage_Forms', ['dosage_form_id'], {
          name: 'measurement_dosage_forms_dosage_form_id_index',
        });
      });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Measurement_Dosage_Forms');
  },
};
