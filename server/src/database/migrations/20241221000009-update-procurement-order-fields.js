'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('Adding missing fields to Procurement_Orders table...');

      // Add sent_date field
      await queryInterface.addColumn(
        'Procurement_Orders',
        'sent_date',
        {
          type: Sequelize.DATE,
          allowNull: true,
        },
        { transaction }
      );

      // Add received_date field
      await queryInterface.addColumn(
        'Procurement_Orders',
        'received_date',
        {
          type: Sequelize.DATE,
          allowNull: true,
        },
        { transaction }
      );

      // Add cancelled_date field
      await queryInterface.addColumn(
        'Procurement_Orders',
        'cancelled_date',
        {
          type: Sequelize.DATE,
          allowNull: true,
        },
        { transaction }
      );

      // Add cancellation_reason field
      await queryInterface.addColumn(
        'Procurement_Orders',
        'cancellation_reason',
        {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        { transaction }
      );

      // Add indexes for new date fields
      await queryInterface.addIndex('Procurement_Orders', ['sent_date'], {
        name: 'idx_procurement_order_sent_date',
        transaction,
      });

      await queryInterface.addIndex('Procurement_Orders', ['received_date'], {
        name: 'idx_procurement_order_received_date',
        transaction,
      });

      await queryInterface.addIndex('Procurement_Orders', ['cancelled_date'], {
        name: 'idx_procurement_order_cancelled_date',
        transaction,
      });

      await transaction.commit();
      console.log('Procurement_Orders table updated successfully!');
    } catch (error) {
      await transaction.rollback();
      console.error('Error updating Procurement_Orders table:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Remove added columns
      await queryInterface.removeColumn('Procurement_Orders', 'sent_date', { transaction });
      await queryInterface.removeColumn('Procurement_Orders', 'received_date', { transaction });
      await queryInterface.removeColumn('Procurement_Orders', 'cancelled_date', { transaction });
      await queryInterface.removeColumn('Procurement_Orders', 'cancellation_reason', {
        transaction,
      });

      await transaction.commit();
      console.log('Procurement_Orders table reverted successfully!');
    } catch (error) {
      await transaction.rollback();
      console.error('Error reverting Procurement_Orders table:', error);
      throw error;
    }
  },
};
