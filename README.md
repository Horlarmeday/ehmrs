# EHMRS

EHMRS is a project to help health care centers manage their clinial, administrative and financial operations.

## Prerequisites
You need to have the following installed on your local development system before you can 
go ahead with this project (except you want to develop using docker).

- [Nodejs](https://nodejs.org/en/download/current/) _at least 10.16.0 or later version_
- [MySQL](https://www.mysql.com/downloads/)
- [MongoDB](https://www.mongodb.com/try/download/community)

## Installation

```bash
# client
cd client
npm install

# server
cd server
npm install
```

## Usage
#### development
For developmental purpose, run the following commands
```bash
# client
npm run serve

# server
npm run migrations
# start dev server
npm run dev
```
#### test
The integration suite runs against a MySQL **test database**, provisioned from a committed schema
snapshot (`server/src/database/test-schema/schema.sql`) rather than from migrations — the
migrations reproduce only ~36 of the ~94 live tables, so a migrated database cannot run the tests.

First, add the test-database settings to `server/.env`:
```bash
TEST_DB_USER=root
TEST_DB_PASS=your_password
TEST_DB_NAME=ehmrs_test   # must contain "test" — the setup script refuses anything else
TEST_DB_HOST=127.0.0.1
```
Then provision it (drops and recreates `TEST_DB_NAME`, structure only — no data) and run the tests:
```bash
cd server
yarn test:db:setup   # load schema.sql into a fresh ehmrs_test
yarn test
```
To refresh the snapshot after the live schema changes:
```bash
mysqldump -h <host> -u <user> -p --no-data --no-tablespaces --routines \
  --set-gtid-purged=OFF <live_db> > server/src/database/test-schema/schema.sql
```
Regenerating the Sequelize migrations to match the real schema (so a migrated database could run
the tests directly) is the principled fix and a separate task.
#### production
To run integration test, run below command
```bash
# client
npm run build

# server
npm run build
npm run start
```
#### docker (recommended)
For docker, run the following commands
##### development
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```
##### test (integration)
```bash
docker-compose -f docker-compose.yml -f docker-compose.integration.yml up --abort-on-container-exit
```
##### production
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --abort-on-container-exit
```


## License
[ISC](https://choosealicense.com/licenses/mit/)