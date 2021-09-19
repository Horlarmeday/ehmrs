'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Prescribed_Drugs', {
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
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      quantity_to_dispense: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      route: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      dosage_form: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      frequency: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      strength: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
      },
      total_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      is_dispensed: {
        type: Sequelize.ENUM('Pending', 'Dispensed', 'Returned'),
        defaultValue: 'Pending',
      },
      examiner: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      date_prescribed: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      payment_status: {
        type: Sequelize.ENUM('Pending', 'Paid', 'Cleared'),
        defaultValue: 'Pending',
      },
      prescribed_strength: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      duration_unit: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      capitated_price: {
        type: Sequelize.DECIMAL(12, 2),
      },
      is_nhis_drug_approved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      visit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      start_date: {
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
    return queryInterface.dropTable('Prescribed_Drugs');
  },
};
