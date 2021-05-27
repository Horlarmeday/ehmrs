module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Complaints', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      complaint: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      frequency: {
        type: Sequelize.ENUM('Minutes', 'Hours', 'Days', 'Weeks', 'Months', 'Years'),
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
      },
      frequency_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
    return queryInterface.dropTable('Complaints');
  },
};
