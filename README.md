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
To run integration test, run below command
```bash
npm run test
```
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