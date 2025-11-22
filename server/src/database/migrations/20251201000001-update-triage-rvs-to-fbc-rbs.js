module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      // Add fbc column
      queryInterface.addColumn('Triages', 'fbc', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      // Add rbs column
      queryInterface.addColumn('Triages', 'rbs', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      // Remove rvs column
      queryInterface.removeColumn('Triages', 'rvs'),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      // Remove fbc and rbs columns
      queryInterface.removeColumn('Triages', 'fbc'),
      queryInterface.removeColumn('Triages', 'rbs'),
      // Add back rvs column
      queryInterface.addColumn('Triages', 'rvs', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },
};

