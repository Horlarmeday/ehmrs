'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface
      .describeTable('quickbooks_credentials')
      .then(() => true)
      .catch(() => false);

    if (tableExists) {
      return Promise.resolve();
    }

    await queryInterface.createTable('quickbooks_credentials', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      client_id_encrypted: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      client_secret_encrypted: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      redirect_uri: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      environment: {
        type: Sequelize.ENUM('SANDBOX', 'PRODUCTION'),
        allowNull: false,
        defaultValue: 'SANDBOX',
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
  },

  down: async queryInterface => {
    const dialect = queryInterface.sequelize.getDialect();

    await queryInterface.dropTable('quickbooks_credentials');

    if (dialect === 'postgres') {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_quickbooks_credentials_environment";'
      );
    }
  },
};

