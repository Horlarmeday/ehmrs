module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Visits', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      date_visit_ended: {
        type: Sequelize.DATE,
      },
      type: {
        type: Sequelize.ENUM('IPD', 'OPD', 'Emergency'),
        allowNull: false,
      },
      staff_id: {
        type: Sequelize.INTEGER,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    return queryInterface.dropTable('Visits');
  },
};
