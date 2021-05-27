module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Histories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      complaint_note: {
        type: Sequelize.TEXT,
      },
      history_note: {
        type: Sequelize.TEXT,
      },
      examination_note: {
        type: Sequelize.TEXT,
      },
      has_smoking_history: {
        type: Sequelize.BOOLEAN,
      },
      staff_id: {
        type: Sequelize.INTEGER,
      },
      visit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
    return queryInterface.dropTable('Histories');
  },
};
