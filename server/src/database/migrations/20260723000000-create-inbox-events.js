'use strict';

/**
 * The Accounting → EMR transactional inbox (issue #4 Phase B2; ADR-0018, ADR-0023, ADR-0025 §6b).
 *
 * Mirror of the outbox on the receiving side: a verified instruction is written to Inbox_Events and
 * committed before the endpoint ACKs; a drain step applies it (flipping payment_status). Durability
 * lives in the table, not a queue. Lands additive — no existing table is touched.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Inbox_Events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      event_id: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true,
      },
      // Dedup guard. UNIQUE is what makes a redelivered instruction impossible to apply twice.
      idempotency_key: {
        type: Sequelize.STRING(200),
        allowNull: false,
        unique: true,
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
      aggregate_type: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      aggregate_id: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      // Monotonic per aggregate, NOT gapless. Never assert contiguity.
      sequence: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(16),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      // IDs and money-as-string only. No demographics (ADR-0016).
      payload: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      key_id: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    // The drainer's only query: PENDING rows, oldest first.
    await queryInterface.addIndex('Inbox_Events', ['status', 'id'], {
      name: 'idx_inbox_events_pending',
    });

    // Gap detection reads the per-aggregate sequence run.
    await queryInterface.addIndex('Inbox_Events', ['aggregate_type', 'aggregate_id', 'sequence'], {
      name: 'idx_inbox_events_aggregate',
    });

    await queryInterface.createTable('Inbox_Dead_Letters', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      event_id: { type: Sequelize.STRING(64), allowNull: true },
      event_type: { type: Sequelize.STRING(64), allowNull: true },
      // NOT unique: the same instruction may legitimately fail across redeliveries, and a unique
      // constraint would throw while recording a failure.
      idempotency_key: { type: Sequelize.STRING(200), allowNull: true },
      reason: { type: Sequelize.STRING(64), allowNull: false },
      detail: { type: Sequelize.TEXT, allowNull: false },
      payload: { type: Sequelize.JSON, allowNull: false },
      inbox_event_id: { type: Sequelize.BIGINT, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('Inbox_Sequences', {
      aggregate_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(64),
      },
      last_applied_sequence: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('Inbox_Events');
    await queryInterface.dropTable('Inbox_Dead_Letters');
    await queryInterface.dropTable('Inbox_Sequences');
  },
};
