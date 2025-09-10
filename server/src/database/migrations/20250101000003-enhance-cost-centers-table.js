'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add new columns to cost_centers table
      await queryInterface.addColumn('Cost_Centers', 'service_line', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Service line (e.g., Cardiology, Orthopedics)',
      });

      await queryInterface.addColumn('Cost_Centers', 'location', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Location (e.g., Main Building, North Wing)',
      });

      await queryInterface.addColumn('Cost_Centers', 'cost_center_type', {
        type: Sequelize.ENUM('CLINICAL', 'ADMINISTRATIVE', 'SUPPORT'),
        allowNull: false,
        defaultValue: 'CLINICAL',
        comment: 'Type of cost center',
      });

      await queryInterface.addColumn('Cost_Centers', 'budget', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Annual budget amount',
      });

      // Update existing records with default values
      await queryInterface.sequelize.query(`
        UPDATE Cost_Centers 
        SET 
          cost_center_type = 'CLINICAL',
          budget = 0
        WHERE cost_center_type IS NULL OR budget IS NULL
      `);

      console.log('✅ Successfully enhanced cost_centers table with hospital-specific fields');
    } catch (error) {
      console.error('❌ Error enhancing cost_centers table:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove the added columns
      await queryInterface.removeColumn('Cost_Centers', 'service_line');
      await queryInterface.removeColumn('Cost_Centers', 'location');
      await queryInterface.removeColumn('Cost_Centers', 'cost_center_type');
      await queryInterface.removeColumn('Cost_Centers', 'budget');

      // Remove the ENUM type
      await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS "enum_Cost_Centers_cost_center_type"
      `);

      console.log('✅ Successfully reverted cost_centers table enhancements');
    } catch (error) {
      console.error('❌ Error reverting cost_centers table enhancements:', error);
      throw error;
    }
  },
};
