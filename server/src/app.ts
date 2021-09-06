import server from './core/startup/server';

server.listen(process.env.PORT, () => console.log(`Running on port ${process.env.PORT}...`));
