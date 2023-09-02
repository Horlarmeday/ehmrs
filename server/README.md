# Create Express App

Create express app is a CLI to bootstrap new express projects.

## Installation

```bash
npm init express-app
# or
npm install -g create-express-app
# or 
npx create-express-app
```

## Creating an App
You’ll need to have Node 10.16.0 or later version on your local development machine. It is highly recommended using the latest LTS version.

To create a new app, you may choose one of the following methods:

#### npx

```bash
npx page-express-app -n my-app
```
_where `my-app` is the name of your project_

__note: there should no space in your project name__

After running this command, you will be prompted for some more questions, just follow it to the end, a `my-app` directory will be created 
inside the current folder. Inside that directory contains the initial project structure.


#### npm

```bash
npm init express-app -n my-app
```

#### Global Installation
If you installed globally i.e you ran `npm install -g create-express-app`. To create a new project run the command below
```bash
page-express-app -n my-app
```

To skip all prompts and go for defaults options, run the command below.
```bash
page-express-app --yes
# or 
npx page-express-app --yes
# or
npm init express-app --yes
```
_`-y` can be used in place of `--yes`_

After creating project and installation is done, you can open your project folder.
```bash
cd my-app
npm run dev
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