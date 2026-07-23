'use strict';

// A standalone Node script run via `node`, not part of the TypeScript build. CommonJS require is
// correct here; there is no import pipeline to hook into.
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Provisions the Jest integration database from the committed schema snapshot.
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
      rows,
    ] = await connection.query(
      'SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = ?',
      [database]
    );
    // eslint-disable-next-line no-console
    console.log(`Test database "${database}" ready: ${rows[0].n} tables loaded from schema.sql.`);
  } finally {
    await connection.end();
  }
}

main().catch(error => {
  // eslint-disable-next-line no-console
  console.error('Failed to set up the test database:', error.message);
  process.exit(1);
});
