module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      // Add fbc column
      queryInterface.addColumn('Observations', 'fbc', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      // Add rbs column
      queryInterface.addColumn('Observations', 'rbs', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      // Remove rvs column
      queryInterface.removeColumn('Observations', 'rvs'),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      // Remove fbc and rbs columns
      queryInterface.removeColumn('Observations', 'fbc'),
      queryInterface.removeColumn('Observations', 'rbs'),
      // Add back rvs column
      queryInterface.addColumn('Observations', 'rvs', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },
};

