module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Triages', {
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
      visit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      weight: {
        type: Sequelize.FLOAT,
      },
      height: {
        type: Sequelize.FLOAT,
      },
      bmi: {
        type: Sequelize.FLOAT,
      },
      rvs: {
        type: Sequelize.STRING,
      },
      pulse: {
        type: Sequelize.FLOAT,
      },
      respiration: {
        type: Sequelize.STRING,
      },
      temperature: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      systolic: {
        type: Sequelize.STRING,
      },
      diastolic: {
        type: Sequelize.STRING,
      },
      heart_rate: {
        type: Sequelize.STRING,
      },
      fetal_heart_rate: {
        type: Sequelize.STRING,
      },
      spo2: {
        type: Sequelize.STRING,
      },
      muac: {
        type: Sequelize.STRING,
      },
      staff_id: {
        type: Sequelize.INTEGER,
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
    return queryInterface.dropTable('Triages');
  },
};
