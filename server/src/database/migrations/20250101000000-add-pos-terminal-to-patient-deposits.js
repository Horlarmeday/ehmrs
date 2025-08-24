'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('patient_deposits', 'pos_terminal_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'pos_terminals',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add index for better query performance
    await queryInterface.addIndex('patient_deposits', ['pos_terminal_id'], {
      name: 'idx_patient_deposits_pos_terminal_id'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index first
    await queryInterface.removeIndex('patient_deposits', 'idx_patient_deposits_pos_terminal_id');
    
    // Remove column
    await queryInterface.removeColumn('patient_deposits', 'pos_terminal_id');
  }
};
