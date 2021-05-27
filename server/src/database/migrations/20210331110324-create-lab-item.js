module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Lab_Items', {
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
      product_code: {
        type: Sequelize.STRING,
      },
      shelf: {
        type: Sequelize.STRING,
      },
      voucher: {
        type: Sequelize.STRING,
      },
      batch: {
        type: Sequelize.STRING,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      remain_quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      unit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      unit_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      total_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      selling_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      expiration: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      staff_id: {
        type: Sequelize.INTEGER,
      },
      date_received: {
        type: Sequelize.DATE,
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
    return queryInterface.dropTable('Lab_Items');
  },
};
