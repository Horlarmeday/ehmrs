module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Pharmacy_Items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      drug_id: {
        type: Sequelize.INTEGER,
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
      dosage_form_id: {
        type: Sequelize.INTEGER,
      },
      staff_id: {
        type: Sequelize.INTEGER,
      },
      date_received: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      measurement_id: {
        type: Sequelize.INTEGER,
      },
      strength_input: {
        type: Sequelize.STRING,
      },
      route_id: {
        type: Sequelize.INTEGER,
      },
      drug_form: {
        type: Sequelize.ENUM('Drug', 'Consumable'),
      },
      status: {
        type: Sequelize.ENUM('Active', 'Inactive'),
        defaultValue: 'Active',
      },
      drug_type: {
        type: Sequelize.ENUM('Cash', 'NHIS'),
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
    return queryInterface.dropTable('Pharmacy_Items');
  },
};
