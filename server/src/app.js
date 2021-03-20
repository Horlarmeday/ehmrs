import { port } from './config/secret';
import server from './startup/server';

server.listen(port, () => console.log(`Running on port ${port}...`));
