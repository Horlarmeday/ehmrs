'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create HMO Drug Pricing table
    await queryInterface.createTable('HMO_Drug_Pricing', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      drug_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Drugs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      insurance_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Insurances',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      hmo_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      patient_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 10.0,
      },
      hmo_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 90.0,
      },
      effective_from: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      effective_to: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('Active', 'Inactive'),
        defaultValue: 'Active',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Create HMO Test Pricing table
    await queryInterface.createTable('HMO_Test_Pricing', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      test_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Tests',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      insurance_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Insurances',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      hmo_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      patient_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 10.0,
      },
      hmo_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 90.0,
      },
      effective_from: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      effective_to: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('Active', 'Inactive'),
        defaultValue: 'Active',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Create HMO Service Pricing table
    await queryInterface.createTable('HMO_Service_Pricing', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      service_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Services',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      insurance_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Insurances',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      hmo_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      patient_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 10.0,
      },
      hmo_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 90.0,
      },
      effective_from: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      effective_to: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('Active', 'Inactive'),
        defaultValue: 'Active',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Create HMO Investigation Pricing table
    await queryInterface.createTable('HMO_Investigation_Pricing', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      investigation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Investigations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      insurance_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Insurances',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      hmo_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      patient_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 10.0,
      },
      hmo_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 90.0,
      },
      effective_from: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      effective_to: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('Active', 'Inactive'),
        defaultValue: 'Active',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex('HMO_Drug_Pricing', ['drug_id', 'insurance_id']);
    await queryInterface.addIndex('HMO_Drug_Pricing', ['status', 'effective_from', 'effective_to']);
    await queryInterface.addIndex('HMO_Test_Pricing', ['test_id', 'insurance_id']);
    await queryInterface.addIndex('HMO_Test_Pricing', ['status', 'effective_from', 'effective_to']);
    await queryInterface.addIndex('HMO_Service_Pricing', ['service_id', 'insurance_id']);
    await queryInterface.addIndex('HMO_Service_Pricing', ['status', 'effective_from', 'effective_to']);
    await queryInterface.addIndex('HMO_Investigation_Pricing', ['investigation_id', 'insurance_id']);
    await queryInterface.addIndex('HMO_Investigation_Pricing', ['status', 'effective_from', 'effective_to']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('HMO_Investigation_Pricing');
    await queryInterface.dropTable('HMO_Service_Pricing');
    await queryInterface.dropTable('HMO_Test_Pricing');
    await queryInterface.dropTable('HMO_Drug_Pricing');
  },
};
