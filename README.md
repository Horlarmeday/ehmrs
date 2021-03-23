# EHMRS

EHMRS is a project to help health care centers manage their clinial, administrative and financial operations.

## Installation

```bash
npm init express-app
# or
npm install -g create-express-app
# or 
npx create-express-app
```
# Express App


## Prerequisites
You need to have the following installed on your local development system before you can 
go ahead with this project (except you want to develop using docker).

- [Nodejs](https://nodejs.org/en/download/current/) _at least 10.16.0 or later version_
- [MySQL](https://www.mysql.com/downloads/)
- [MongoDB](https://www.mongodb.com/try/download/community)

## Usage
#### development
For developmental purpose, run the following commands
```bash
# run the migrations
npm run migrations
# start dev server
npm run dev
```
#### test
To run integration test, run below command
```bash
npm run test
```
#### production
To run integration test, run below command
```bash
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
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)