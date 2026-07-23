'use strict';

/**
 * The EMR → Accounting transactional outbox (issue #4 Phase A1; ADR-0018, ADR-0025, ADR-0027).
 *
 * Lands INERT: no code writes to these tables until the emission flag is enabled. Creating them
 * first and separately means this migration cannot affect clinical behaviour at all.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Outbox_Events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      aggregate_type: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      // `visit:{visit_id}` - this EMR maps Visit onto the contract's encounter aggregate
      // (ADR-0027); no order-grouping exists on its prescribed lines.
      aggregate_id: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      // Monotonic per aggregate, NOT gapless. Never assert contiguity.
      sequence: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      event_type: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      event_version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      // `charge:{type}:{id}`. UNIQUE is the guarantee that one clinical fact yields one event -
      // it is what makes a double-write of the same line impossible to turn into two charges.
      idempotency_key: {
        type: Sequelize.STRING(200),
        allowNull: false,
        unique: true,
      },
      // IDs and money-as-string only. No demographics (ADR-0016).
      payload: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      last_error: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    // The drainer's only query: unsent rows, oldest first. Leading with sent_at keeps the scan
    // proportional to the backlog rather than to all history.
    await queryInterface.addIndex('Outbox_Events', ['sent_at', 'id'], {
      name: 'idx_outbox_events_unsent',
    });

    await queryInterface.createTable('Outbox_Sequences', {
      aggregate_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(64),
      },
      last_sequence: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
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
  },

  down: async queryInterface => {
    await queryInterface.dropTable('Outbox_Events');
    await queryInterface.dropTable('Outbox_Sequences');
  },
};
