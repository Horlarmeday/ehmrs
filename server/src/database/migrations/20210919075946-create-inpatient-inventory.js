'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Inpatient_Inventories', {
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
      quantity_received: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      shelf: {
        type: Sequelize.STRING,
      },
      unit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      selling_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      expiration: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      quantity_consumed: {
        type: Sequelize.INTEGER,
      },
      dosage_form_id: {
        type: Sequelize.INTEGER,
      },
      measurement_id: {
        type: Sequelize.INTEGER,
      },
      strength_input: {
        type: Sequelize.STRING,
      },
      staff_id: {
        type: Sequelize.INTEGER,
      },
      drug_form: {
        type: Sequelize.ENUM('Drug', 'Consumable'),
        allowNull: false,
      },
      quantity_left: {
        type: Sequelize.INTEGER,
      },
      drug_type: { type: Sequelize.ENUM('Cash', 'NHIS'), allowNull: false },
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
    return queryInterface.dropTable('Inpatient_Inventories');
  }
};