'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('Creating Procurement Order History table...');

      await queryInterface.createTable(
        'Procurement_Order_History',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          procurement_order_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'Procurement_Orders',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          action: {
            type: Sequelize.ENUM(
              'CREATED',
              'UPDATED',
              'APPROVED',
              'SENT',
              'RECEIVED',
              'CANCELLED',
              'STATUS_CHANGED',
              'AMOUNT_CHANGED',
              'VENDOR_CHANGED',
              'DATE_CHANGED'
            ),
            allowNull: false,
          },
          change_type: {
            type: Sequelize.ENUM(
              'FIELD_UPDATE',
              'STATUS_CHANGE',
              'ITEM_ADDED',
              'ITEM_REMOVED',
              'ITEM_UPDATED',
              'APPROVAL',
              'CANCELLATION'
            ),
            allowNull: false,
          },
          staff_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'Staffs',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          field_name: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          old_value: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          new_value: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          reason: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          notes: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          metadata: {
            type: Sequelize.JSON,
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
        },
        { transaction }
      );

      // Add indexes for performance
      await queryInterface.addIndex('Procurement_Order_History', ['procurement_order_id'], {
        name: 'idx_procurement_order_history_order',
        transaction,
      });

      await queryInterface.addIndex('Procurement_Order_History', ['action'], {
        name: 'idx_procurement_order_history_action',
        transaction,
      });

      await queryInterface.addIndex('Procurement_Order_History', ['staff_id'], {
        name: 'idx_procurement_order_history_staff',
        transaction,
      });

      await queryInterface.addIndex('Procurement_Order_History', ['createdAt'], {
        name: 'idx_procurement_order_history_date',
        transaction,
      });

      await queryInterface.addIndex(
        'Procurement_Order_History',
        ['procurement_order_id', 'action', 'createdAt'],
        {
          name: 'idx_procurement_order_history_composite',
          transaction,
        }
      );

      await transaction.commit();
      console.log('Procurement Order History table created successfully!');
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating Procurement Order History table:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.dropTable('Procurement_Order_History', { transaction });

      await transaction.commit();
      console.log('Procurement Order History table dropped successfully!');
    } catch (error) {
      await transaction.rollback();
      console.error('Error dropping Procurement Order History table:', error);
      throw error;
    }
  },
};
