'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Combo_Investigation_Items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      combo_investigation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Combo_Investigations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      investigation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Investigations',
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

    // Add index on combo_investigation_id for faster lookups
    await queryInterface.addIndex('Combo_Investigation_Items', ['combo_investigation_id']);

    // Add index on investigation_id for referential checks
    await queryInterface.addIndex('Combo_Investigation_Items', ['investigation_id']);

    // Add unique constraint to prevent duplicate investigation_id in same combo
    await queryInterface.addConstraint('Combo_Investigation_Items', {
      fields: ['combo_investigation_id', 'investigation_id'],
      type: 'unique',
      name: 'unique_combo_investigation_item',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Combo_Investigation_Items');
  },
};
