'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Admissions', 'last_charged_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: 'Last date a daily hospitalization fee was charged for this admission',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Admissions', 'last_charged_date');
  },
};

