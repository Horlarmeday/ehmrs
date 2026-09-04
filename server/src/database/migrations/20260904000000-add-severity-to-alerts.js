module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Alerts', 'severity', {
      type: Sequelize.ENUM('Critical', 'Warning', 'Info'),
      allowNull: false,
      defaultValue: 'Warning',
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('Alerts', 'severity');
  },
};
