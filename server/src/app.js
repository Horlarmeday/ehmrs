import server from './startup/server';

server.listen(process.env.PORT, () => console.log(`Running on port ${process.env.PORT}...`));
