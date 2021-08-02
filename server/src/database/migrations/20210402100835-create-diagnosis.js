module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Diagnoses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      diagnosis: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      certainty: {
        type: Sequelize.ENUM('Presumed', 'Confirmed'),
        allowNull: false,
      },
      order: {
        type: Sequelize.ENUM('Primary', 'Secondary'),
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
      },
      visit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      staff_id: {
        type: Sequelize.INTEGER,
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
    return queryInterface.dropTable('Diagnoses');
  },
};
