import config from 'config';
import app from './app.js';
import { store } from './services/database.js';

await store.init();

const port = Number(config.get('server.port'));
const debug: string = config.get('server.debug');

const server = app({
  logger: {
    transport:
      process.env.NODE_ENV === 'development' || debug
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
            },
          }
        : undefined,
  },
  ignoreTrailingSlash: true,
});

server.listen({ port }, error => {
  if (error) {
    console.log(error);
    process.exit(1);
  }
});
