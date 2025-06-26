'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Staffs', 'date_of_first_appointment', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('Staffs', 'date_of_commencement', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('Staffs', 'dolp', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('Staffs', 'qualification', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Staffs', 'present_rank', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Staffs', 'chs_cms', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Staffs', 'step', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('Staffs', 'dd_for_retirement', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('Staffs', 'nin', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Staffs', 'date_of_first_appointment');
    await queryInterface.removeColumn('Staffs', 'date_of_commencement');
    await queryInterface.removeColumn('Staffs', 'dolp');
    await queryInterface.removeColumn('Staffs', 'qualification');
    await queryInterface.removeColumn('Staffs', 'present_rank');
    await queryInterface.removeColumn('Staffs', 'chs_cms');
    await queryInterface.removeColumn('Staffs', 'step');
    await queryInterface.removeColumn('Staffs', 'dd_for_retirement');
    await queryInterface.removeColumn('Staffs', 'nin');
  },
};
