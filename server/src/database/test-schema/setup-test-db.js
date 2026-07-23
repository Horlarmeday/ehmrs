'use strict';

// A standalone Node script run via `node`, not part of the TypeScript build. CommonJS require is
// correct here; there is no import pipeline to hook into.
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Provisions the Jest integration database from the committed schema snapshot, then applies any
 * migrations that POSTDATE the snapshot.
 *
 * WHY A SNAPSHOT RATHER THAN MIGRATIONS
 * -------------------------------------
 * The repo's Sequelize migrations reproduce only ~36 of the ~94 live tables — the migration
 * history was abandoned long ago and the schema evolved by other means. A migrated database is
 * missing 61 tables (Admissions, Clinical_Notes, three of the five Prescribed_* tables, …) and
 * mis-declares columns the models treat as virtual (e.g. Staffs.fullname), so tests cannot run
 * against it. `schema.sql` is a structure-only dump of the real schema; this script loads it into
 * a freshly-recreated TEST_DB_NAME. Regenerating the migrations to match reality is the principled
 * fix and a separate task.
 *
 * Structure only — no patient data is ever copied.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

/**
 * schema.sql is a snapshot of the live schema. Every table produced by a migration up to and
 * including this prefix is already in the snapshot; any migration whose filename sorts strictly
 * AFTER it is a change made SINCE the snapshot and is applied on top — so a new migration (the
 * outbox tables) reaches the test database without waiting for the snapshot to be refreshed.
 *
 * Set to the last migration reflected in the current snapshot. When schema.sql is regenerated
 * from a live DB that already has the outbox tables, bump this to the outbox migration's prefix
 * so it is not re-applied on top of itself.
 */
const SNAPSHOT_MIGRATION_PREFIX = '20230606';

async function applyPostSnapshotMigrations({ host, user, password, port, database }) {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const pending = fs
    .readdirSync(migrationsDir)
    .filter(file => file.endsWith('.js'))
    // Strictly after the snapshot: the snapshot migration itself is already reflected in it.
    .filter(file => file.slice(0, SNAPSHOT_MIGRATION_PREFIX.length) > SNAPSHOT_MIGRATION_PREFIX)
    .sort();

  if (pending.length === 0) {
    return [];
  }

  const sequelize = new Sequelize(database, user, password, {
    host,
    port,
    dialect: 'mysql',
    logging: false,
  });
  try {
    const queryInterface = sequelize.getQueryInterface();
    for (const file of pending) {
      // eslint-disable-next-line global-require
      const migration = require(path.join(migrationsDir, file));
      await migration.up(queryInterface, Sequelize);
    }
  } finally {
    await sequelize.close();
  }
  return pending;
}

async function main() {
  const database = process.env.TEST_DB_NAME;
  const host = process.env.TEST_DB_HOST;
  const user = process.env.TEST_DB_USER;
  const password = process.env.TEST_DB_PASS;
  const port = process.env.DB_PORT || 3306;

  if (!database || !host || !user) {
    throw new Error(
      'Missing TEST_DB_* environment. Set TEST_DB_NAME, TEST_DB_HOST, TEST_DB_USER, TEST_DB_PASS ' +
        'in .env (see README).'
    );
  }

  // Refuse to point this at anything that is not obviously a test database. Recreating a database
  // is destructive, and a fat-fingered TEST_DB_NAME must never be able to drop production.
  if (!/test/i.test(database)) {
    throw new Error(
      `Refusing to (re)create "${database}": the test database name must contain "test". ` +
        'This guard exists so this script can never drop a non-test database.'
    );
  }

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  const connection = await mysql.createConnection({
    host,
    user,
    password,
    port,
    multipleStatements: true,
  });

  try {
    await connection.query(`DROP DATABASE IF EXISTS \`${database}\``);
    await connection.query(
      `CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await connection.changeUser({ database });
    await connection.query(schema);

    const [
      snapshotRows,
    ] = await connection.query(
      'SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = ?',
      [database]
    );
    // eslint-disable-next-line no-console
    console.log(`Loaded schema.sql: ${snapshotRows[0].n} tables.`);
  } finally {
    await connection.end();
  }

  const applied = await applyPostSnapshotMigrations({ host, user, password, port, database });
  if (applied.length > 0) {
    // eslint-disable-next-line no-console
    console.log(`Applied ${applied.length} post-snapshot migration(s): ${applied.join(', ')}`);
  }
  // eslint-disable-next-line no-console
  console.log(`Test database "${database}" ready.`);
}

main().catch(error => {
  // eslint-disable-next-line no-console
  console.error('Failed to set up the test database:', error.message);
  process.exit(1);
});
