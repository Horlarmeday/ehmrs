module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Visits', 'is_from_appointment', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Visits', 'is_from_appointment');
  },
};
