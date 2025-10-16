module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('Route_Dosage_Forms', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        route_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Route_of_Administrations',
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
        return queryInterface.addConstraint('Route_Dosage_Forms', {
          fields: ['route_id', 'dosage_form_id'],
          type: 'unique',
          name: 'unique_route_dosage_form',
        });
      })
      .then(() => {
        // Add indexes for performance
        return queryInterface.addIndex('Route_Dosage_Forms', ['route_id'], {
          name: 'route_dosage_forms_route_id_index',
        });
      })
      .then(() => {
        return queryInterface.addIndex('Route_Dosage_Forms', ['dosage_form_id'], {
          name: 'route_dosage_forms_dosage_form_id_index',
        });
      });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Route_Dosage_Forms');
  },
};
