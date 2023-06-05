module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Drug_Tariffs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      hmo_id: {
        type: Sequelize.INTEGER,
      },
      drug_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      insurance_id: {
        type: Sequelize.INTEGER,
      },
      price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
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
    return queryInterface.dropTable('Drug_Tariffs');
  },
};
