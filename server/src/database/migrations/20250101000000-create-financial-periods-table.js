'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then(tables => tables.includes('financial_periods'));

    if (tableExists) {
      console.log('✅ Financial periods table already exists, skipping creation');
      return;
    }

    await queryInterface.createTable('financial_periods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('OPEN', 'CLOSED', 'LOCKED'),
        allowNull: false,
        defaultValue: 'OPEN',
      },
      balance: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'staff',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'staff',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex('financial_periods', ['name'], { unique: true });
    await queryInterface.addIndex('financial_periods', ['status']);
    await queryInterface.addIndex('financial_periods', ['start_date']);
    await queryInterface.addIndex('financial_periods', ['end_date']);
    await queryInterface.addIndex('financial_periods', ['created_by']);

    // Create a default financial period for the current year
    const currentYear = new Date().getFullYear();
    const defaultPeriod = {
      name: `FY ${currentYear}`,
      start_date: new Date(`${currentYear}-01-01`),
      end_date: new Date(`${currentYear}-12-31`),
      status: 'OPEN',
      balance: 0.0,
      notes: `Default financial period for fiscal year ${currentYear}`,
      created_by: 1, // Assuming admin user ID is 1
      created_at: new Date(),
      updated_at: new Date(),
    };

    await queryInterface.bulkInsert('financial_periods', [defaultPeriod]);

    console.log('✅ Successfully created financial_periods table with default period');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('financial_periods');
    console.log('✅ Successfully dropped financial_periods table');
  },
};
