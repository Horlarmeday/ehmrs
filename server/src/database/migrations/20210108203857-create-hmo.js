module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('HMOs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      hmo_num: {
        type: Sequelize.STRING,
      },
      staff_id: {
        type: Sequelize.INTEGER,
      },
      insurance_id: {
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
    return queryInterface.dropTable('HMOs');
  },
};
