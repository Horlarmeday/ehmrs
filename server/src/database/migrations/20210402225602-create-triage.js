'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Triages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id: {
        type: Sequelize.INTEGER
      },
      patient_id: {
        type: Sequelize.INTEGER
      },
      visit_id: {
        type: Sequelize.INTEGER
      },
      weight: {
        type: Sequelize.FLOAT
      },
      height: {
        type: Sequelize.FLOAT
      },
      bmi: {
        type: Sequelize.FLOAT
      },
      rvs: {
        type: Sequelize.STRING
      },
      pulse: {
        type: Sequelize.FLOAT
      },
      respiration: {
        type: Sequelize.STRING
      },
      temperature: {
        type: Sequelize.FLOAT
      },
      systolic: {
        type: Sequelize.INTEGER
      },
      diastolic: {
        type: Sequelize.INTEGER
      },
      heartrate: {
        type: Sequelize.INTEGER
      },
      fetal_heart_rate: {
        type: Sequelize.INTEGER
      },
      spo2: {
        type: Sequelize.INTEGER
      },
      muac: {
        type: Sequelize.STRING
      },
      staff_id: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Triages');
  }
};