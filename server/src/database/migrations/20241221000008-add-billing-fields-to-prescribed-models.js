'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add billing fields to Prescribed_Drugs table
    await queryInterface.addColumn('Prescribed_Drugs', 'billing_mode', {
      type: Sequelize.ENUM('CASH', 'INSURANCE', 'WAIVER', 'OTHER', 'FREE', 'WALLET'),
      allowNull: true,
      defaultValue: 'CASH',
    });

    await queryInterface.addColumn('Prescribed_Drugs', 'patient_co_pay_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    });

    await queryInterface.addColumn('Prescribed_Drugs', 'hmo_billed_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    });

    // Add billing fields to Prescribed_Tests table
    await queryInterface.addColumn('Prescribed_Tests', 'billing_mode', {
      type: Sequelize.ENUM('CASH', 'INSURANCE', 'WAIVER', 'OTHER', 'FREE', 'WALLET'),
      allowNull: true,
      defaultValue: 'CASH',
    });

    await queryInterface.addColumn('Prescribed_Tests', 'patient_co_pay_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    });

    await queryInterface.addColumn('Prescribed_Tests', 'hmo_billed_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    });

    // Add billing fields to Prescribed_Investigations table
    await queryInterface.addColumn('Prescribed_Investigations', 'billing_mode', {
      type: Sequelize.ENUM('CASH', 'INSURANCE', 'WAIVER', 'OTHER', 'FREE', 'WALLET'),
      allowNull: true,
      defaultValue: 'CASH',
    });

    await queryInterface.addColumn('Prescribed_Investigations', 'patient_co_pay_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    });

    await queryInterface.addColumn('Prescribed_Investigations', 'hmo_billed_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    });

    // Add billing fields to Prescribed_Services table
    await queryInterface.addColumn('Prescribed_Services', 'billing_mode', {
      type: Sequelize.ENUM('CASH', 'INSURANCE', 'WAIVER', 'OTHER', 'FREE', 'WALLET'),
      allowNull: true,
      defaultValue: 'CASH',
    });

    await queryInterface.addColumn('Prescribed_Services', 'patient_co_pay_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    });

    await queryInterface.addColumn('Prescribed_Services', 'hmo_billed_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    });

    // Add billing fields to Prescribed_Additional_Items table
    await queryInterface.addColumn('Prescribed_Additional_Items', 'billing_mode', {
      type: Sequelize.ENUM('CASH', 'INSURANCE', 'WAIVER', 'OTHER', 'FREE', 'WALLET'),
      allowNull: true,
      defaultValue: 'CASH',
    });

    await queryInterface.addColumn('Prescribed_Additional_Items', 'patient_co_pay_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    });

    await queryInterface.addColumn('Prescribed_Additional_Items', 'hmo_billed_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    });

    // Add indexes for better performance
    await queryInterface.addIndex('Prescribed_Drugs', ['billing_mode']);
    await queryInterface.addIndex('Prescribed_Tests', ['billing_mode']);
    await queryInterface.addIndex('Prescribed_Investigations', ['billing_mode']);
    await queryInterface.addIndex('Prescribed_Services', ['billing_mode']);
    await queryInterface.addIndex('Prescribed_Additional_Items', ['billing_mode']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove billing fields from Prescribed_Drugs table
    await queryInterface.removeColumn('Prescribed_Drugs', 'billing_mode');
    await queryInterface.removeColumn('Prescribed_Drugs', 'patient_co_pay_amount');
    await queryInterface.removeColumn('Prescribed_Drugs', 'hmo_billed_amount');

    // Remove billing fields from Prescribed_Tests table
    await queryInterface.removeColumn('Prescribed_Tests', 'billing_mode');
    await queryInterface.removeColumn('Prescribed_Tests', 'patient_co_pay_amount');
    await queryInterface.removeColumn('Prescribed_Tests', 'hmo_billed_amount');

    // Remove billing fields from Prescribed_Investigations table
    await queryInterface.removeColumn('Prescribed_Investigations', 'billing_mode');
    await queryInterface.removeColumn('Prescribed_Investigations', 'patient_co_pay_amount');
    await queryInterface.removeColumn('Prescribed_Investigations', 'hmo_billed_amount');

    // Remove billing fields from Prescribed_Services table
    await queryInterface.removeColumn('Prescribed_Services', 'billing_mode');
    await queryInterface.removeColumn('Prescribed_Services', 'patient_co_pay_amount');
    await queryInterface.removeColumn('Prescribed_Services', 'hmo_billed_amount');

    // Remove billing fields from Prescribed_Additional_Items table
    await queryInterface.removeColumn('Prescribed_Additional_Items', 'billing_mode');
    await queryInterface.removeColumn('Prescribed_Additional_Items', 'patient_co_pay_amount');
    await queryInterface.removeColumn('Prescribed_Additional_Items', 'hmo_billed_amount');
  },
};
