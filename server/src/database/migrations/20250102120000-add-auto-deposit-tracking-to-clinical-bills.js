module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('clinical_bills', 'auto_deposit_attempted', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Tracks if automatic deposit payment has been attempted for this bill',
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('clinical_bills', 'auto_deposit_attempted');
  },
};

