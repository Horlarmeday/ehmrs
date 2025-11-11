'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface
      .describeTable('quickbooks_connections')
      .then(() => true)
      .catch(() => false);

    if (tableExists) {
      return Promise.resolve();
    }

    await queryInterface.createTable('quickbooks_connections', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      realm_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      environment: {
        type: Sequelize.ENUM('SANDBOX', 'PRODUCTION'),
        allowNull: false,
        defaultValue: 'SANDBOX',
      },
      access_token_encrypted: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      refresh_token_encrypted: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      access_token_expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      refresh_token_expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      last_synced_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      connected_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      disconnected_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_connected: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('quickbooks_connections', ['realm_id'], {
      name: 'quickbooks_connections_realm_id_idx',
      unique: true,
    });

    await queryInterface.addIndex('quickbooks_connections', ['is_connected'], {
      name: 'quickbooks_connections_is_connected_idx',
    });
  },

  down: async queryInterface => {
    const dialect = queryInterface.sequelize.getDialect();

    await queryInterface.dropTable('quickbooks_connections');

    if (dialect === 'postgres') {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_quickbooks_connections_environment";'
      );
    }
  },
};

