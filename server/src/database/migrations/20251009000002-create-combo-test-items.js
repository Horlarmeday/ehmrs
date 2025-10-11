'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Combo_Test_Items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      combo_test_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Combo_Tests',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      test_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Tests',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
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

    // Add index on combo_test_id for faster lookups
    await queryInterface.addIndex('Combo_Test_Items', ['combo_test_id']);

    // Add index on test_id for referential checks
    await queryInterface.addIndex('Combo_Test_Items', ['test_id']);

    // Add unique constraint to prevent duplicate test_id in same combo
    await queryInterface.addConstraint('Combo_Test_Items', {
      fields: ['combo_test_id', 'test_id'],
      type: 'unique',
      name: 'unique_combo_test_item',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Combo_Test_Items');
  },
};
