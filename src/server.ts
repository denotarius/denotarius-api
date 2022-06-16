import app from './app';
import config from 'config';

const port = Number(config.get('server.port'));

const server = app({
  logger: {
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
  ignoreTrailingSlash: true,
  // https://www.fastify.io/docs/latest/Server/#maxparamlength
  // if the param overflows this number, 404 will be returned
  // currently the biggest param seems to be the address which can be 30864 (haxxxors having fun)
  // select tx_id,LENGTH(address) from tx_out where LENGTH(address) > 16000 ORDER BY LENGTH(address) desc LIMIT 10;
  maxParamLength: 32_768,
});

server.listen({ port }, error => {
  if (error) {
    console.log(error);
    process.exit(1);
  }
});
