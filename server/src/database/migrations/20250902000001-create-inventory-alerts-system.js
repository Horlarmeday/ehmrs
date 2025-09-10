'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. InventoryAlertConfiguration table
      await queryInterface.createTable(
        'inventory_alert_configurations',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
          },
          name: {
            type: Sequelize.STRING(100),
            allowNull: false,
            comment: 'Configuration name (e.g., "Critical Stock Level", "Expiry Warning")',
          },
          alert_type: {
            type: Sequelize.ENUM('STOCK_LEVEL', 'EXPIRY', 'PROCUREMENT', 'CRITICAL', 'FINANCIAL'),
            allowNull: false,
            comment: 'Type of alert being configured',
          },
          severity: {
            type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
            allowNull: false,
            defaultValue: 'MEDIUM',
            comment: 'Alert severity level',
          },
          store_type: {
            type: Sequelize.ENUM('PHARMACY', 'GENERAL_STORE', 'LABORATORY', 'ALL'),
            allowNull: false,
            defaultValue: 'ALL',
            comment: 'Which store type this configuration applies to',
          },
          department_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'Specific department (null = all departments)',
          },
          category_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'Specific category (null = all categories)',
          },
          // Threshold configurations
          stock_threshold_type: {
            type: Sequelize.ENUM('ABSOLUTE', 'PERCENTAGE'),
            allowNull: true,
            comment: 'How to calculate stock threshold',
          },
          stock_threshold_value: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            comment: 'Threshold value (absolute number or percentage)',
          },
          expiry_days_warning: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'Days before expiry to trigger alert',
          },
          // Notification settings
          notification_enabled: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Whether notifications are enabled for this configuration',
          },
          email_enabled: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Send email notifications',
          },
          sms_enabled: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Send SMS notifications',
          },
          sound_enabled: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Play sound for this alert',
          },
          popup_enabled: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Show popup modal for this alert',
          },
          // Escalation settings
          escalation_enabled: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Enable alert escalation',
          },
          escalation_minutes: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'Minutes before escalating unacknowledged alert',
          },
          escalation_roles: {
            type: Sequelize.JSON,
            allowNull: true,
            comment: 'Array of role IDs to escalate to',
          },
          // Status and metadata
          is_active: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Whether this configuration is active',
          },
          created_by: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: 'Staff ID who created this configuration',
          },
          updated_by: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'Staff ID who last updated this configuration',
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
        },
        { transaction }
      );

      // 2. InventoryAlert table
      await queryInterface.createTable(
        'inventory_alerts',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
          },
          configuration_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'inventory_alert_configurations',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
            comment: 'Reference to alert configuration',
          },
          alert_type: {
            type: Sequelize.ENUM('STOCK_LEVEL', 'EXPIRY', 'PROCUREMENT', 'CRITICAL', 'FINANCIAL'),
            allowNull: false,
            comment: 'Type of alert',
          },
          severity: {
            type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
            allowNull: false,
            comment: 'Alert severity level',
          },
          // Item and location identification
          store_type: {
            type: Sequelize.ENUM('PHARMACY', 'GENERAL_STORE', 'LABORATORY'),
            allowNull: false,
            comment: 'Which store this alert relates to',
          },
          item_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'General store item ID (if applicable)',
          },
          pharmacy_item_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'Pharmacy item ID (if applicable)',
          },
          dispensary_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'Dispensary ID (if specific to dispensary)',
          },
          // Alert content
          title: {
            type: Sequelize.STRING(200),
            allowNull: false,
            comment: 'Alert title/headline',
          },
          message: {
            type: Sequelize.TEXT,
            allowNull: false,
            comment: 'Alert description/details',
          },
          context_data: {
            type: Sequelize.JSON,
            allowNull: true,
            comment: 'Additional context data for the alert (item details, quantities, etc.)',
          },
          // Alert metadata
          trigger_value: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            comment: 'The value that triggered this alert (stock level, days to expiry, etc.)',
          },
          threshold_value: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            comment: 'The threshold that was crossed',
          },
          // Status tracking
          status: {
            type: Sequelize.ENUM('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'),
            allowNull: false,
            defaultValue: 'ACTIVE',
            comment: 'Current status of the alert',
          },
          priority: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 5,
            comment: 'Alert priority (1 = highest, 10 = lowest)',
          },
          // Acknowledgment tracking
          acknowledged_at: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'When alert was acknowledged',
          },
          acknowledged_by: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'Staff ID who acknowledged the alert',
          },
          resolved_at: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'When alert was resolved',
          },
          resolved_by: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'Staff ID who resolved the alert',
          },
          resolution_notes: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Notes about how the alert was resolved',
          },
          // Notification tracking
          notifications_sent: {
            type: Sequelize.JSON,
            allowNull: true,
            comment: 'Array of notification channels used and timestamps',
          },
          escalated_at: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'When alert was escalated (if applicable)',
          },
          escalated_to: {
            type: Sequelize.JSON,
            allowNull: true,
            comment: 'Array of role IDs or staff IDs that were escalated to',
          },
          // Auto-resolution settings
          auto_resolve_enabled: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Whether this alert can be auto-resolved',
          },
          expires_at: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'When alert expires (for temporary alerts)',
          },
          // Timestamps
          triggered_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            comment: 'When alert was first triggered',
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
        },
        { transaction }
      );

      // 3. InventoryAlertLog table
      await queryInterface.createTable(
        'inventory_alert_logs',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
          },
          alert_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'inventory_alerts',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            comment: 'Reference to the alert',
          },
          action: {
            type: Sequelize.ENUM(
              'CREATED',
              'ACKNOWLEDGED',
              'ESCALATED',
              'RESOLVED',
              'DISMISSED',
              'NOTIFICATION_SENT',
              'AUTO_RESOLVED'
            ),
            allowNull: false,
            comment: 'What action was taken',
          },
          action_by: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'Staff ID who performed the action (null for system actions)',
          },
          notification_channel: {
            type: Sequelize.ENUM('WEBSOCKET', 'EMAIL', 'SMS', 'PUSH', 'POPUP'),
            allowNull: true,
            comment: 'Channel used for notification (if applicable)',
          },
          details: {
            type: Sequelize.JSON,
            allowNull: true,
            comment: 'Additional details about the action',
          },
          notes: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Additional notes about the action',
          },
          ip_address: {
            type: Sequelize.STRING(45),
            allowNull: true,
            comment: 'IP address of user who performed action',
          },
          user_agent: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'User agent string',
          },
          created_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
        },
        { transaction }
      );

      // 4. Create indexes for performance
      await queryInterface.addIndex('inventory_alert_configurations', ['alert_type', 'is_active'], {
        name: 'idx_alert_configs_type_active',
        transaction,
      });

      await queryInterface.addIndex('inventory_alert_configurations', ['store_type', 'is_active'], {
        name: 'idx_alert_configs_store_active',
        transaction,
      });

      await queryInterface.addIndex('inventory_alerts', ['status', 'severity', 'created_at'], {
        name: 'idx_alerts_status_severity_created',
        transaction,
      });

      await queryInterface.addIndex('inventory_alerts', ['store_type', 'status'], {
        name: 'idx_alerts_store_status',
        transaction,
      });

      await queryInterface.addIndex('inventory_alerts', ['item_id', 'status'], {
        name: 'idx_alerts_item_status',
        transaction,
      });

      await queryInterface.addIndex('inventory_alerts', ['triggered_at'], {
        name: 'idx_alerts_triggered_at',
        transaction,
      });

      await queryInterface.addIndex('inventory_alert_logs', ['alert_id', 'created_at'], {
        name: 'idx_alert_logs_alert_created',
        transaction,
      });

      // 5. Insert default alert configurations
      await queryInterface.bulkInsert(
        'inventory_alert_configurations',
        [
          // Critical stock level alerts
          {
            name: 'Critical Stock Level - Pharmacy',
            alert_type: 'STOCK_LEVEL',
            severity: 'CRITICAL',
            store_type: 'PHARMACY',
            stock_threshold_type: 'ABSOLUTE',
            stock_threshold_value: 5,
            notification_enabled: true,
            email_enabled: false,
            sms_enabled: false,
            sound_enabled: true,
            popup_enabled: true,
            escalation_enabled: true,
            escalation_minutes: 30,
            escalation_roles: JSON.stringify(['pharmacy_manager', 'administrator']),
            is_active: true,
            created_by: 1,
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            name: 'Critical Stock Level - General Store',
            alert_type: 'STOCK_LEVEL',
            severity: 'CRITICAL',
            store_type: 'GENERAL_STORE',
            stock_threshold_type: 'ABSOLUTE',
            stock_threshold_value: 10,
            notification_enabled: true,
            email_enabled: false,
            sms_enabled: false,
            sound_enabled: true,
            popup_enabled: true,
            escalation_enabled: true,
            escalation_minutes: 60,
            escalation_roles: JSON.stringify(['store_manager', 'administrator']),
            is_active: true,
            created_by: 1,
            created_at: new Date(),
            updated_at: new Date(),
          },
          // Low stock warnings
          {
            name: 'Low Stock Warning - All Stores',
            alert_type: 'STOCK_LEVEL',
            severity: 'MEDIUM',
            store_type: 'ALL',
            stock_threshold_type: 'PERCENTAGE',
            stock_threshold_value: 20.0,
            notification_enabled: true,
            email_enabled: false,
            sms_enabled: false,
            sound_enabled: false,
            popup_enabled: false,
            escalation_enabled: false,
            is_active: true,
            created_by: 1,
            created_at: new Date(),
            updated_at: new Date(),
          },
          // Expiry warnings
          {
            name: 'Expiry Warning - 30 Days',
            alert_type: 'EXPIRY',
            severity: 'MEDIUM',
            store_type: 'ALL',
            expiry_days_warning: 30,
            notification_enabled: true,
            email_enabled: false,
            sms_enabled: false,
            sound_enabled: false,
            popup_enabled: false,
            escalation_enabled: false,
            is_active: true,
            created_by: 1,
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            name: 'Critical Expiry Warning - 7 Days',
            alert_type: 'EXPIRY',
            severity: 'HIGH',
            store_type: 'ALL',
            expiry_days_warning: 7,
            notification_enabled: true,
            email_enabled: true,
            sms_enabled: false,
            sound_enabled: true,
            popup_enabled: true,
            escalation_enabled: true,
            escalation_minutes: 120,
            escalation_roles: JSON.stringify([
              'store_manager',
              'pharmacy_manager',
              'administrator',
            ]),
            is_active: true,
            created_by: 1,
            created_at: new Date(),
            updated_at: new Date(),
          },
          // Procurement alerts
          {
            name: 'Urgent Procurement Required',
            alert_type: 'PROCUREMENT',
            severity: 'HIGH',
            store_type: 'ALL',
            stock_threshold_type: 'ABSOLUTE',
            stock_threshold_value: 0,
            notification_enabled: true,
            email_enabled: true,
            sms_enabled: false,
            sound_enabled: true,
            popup_enabled: true,
            escalation_enabled: true,
            escalation_minutes: 240,
            escalation_roles: JSON.stringify(['procurement_officer', 'administrator']),
            is_active: true,
            created_by: 1,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        { transaction }
      );

      await transaction.commit();
      console.log('✅ Inventory alerts system tables created successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error creating inventory alerts system tables:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Drop tables in reverse order (respecting foreign key constraints)
      await queryInterface.dropTable('inventory_alert_logs', { transaction });
      await queryInterface.dropTable('inventory_alerts', { transaction });
      await queryInterface.dropTable('inventory_alert_configurations', { transaction });

      await transaction.commit();
      console.log('✅ Inventory alerts system tables dropped successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error dropping inventory alerts system tables:', error);
      throw error;
    }
  },
};
