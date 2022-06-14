import fastify, { FastifyInstance } from 'fastify';
import path from 'path';
import AutoLoad from '@fastify/autoload';
import { notFoundHandler, errorHandler } from './utils/error-handler';
import fastifyCors from '@fastify/cors';

const start = (options = {}): FastifyInstance => {
  const app = fastify(options);

  app.register(fastifyCors, {
    origin: '*',
  });

  app.setErrorHandler((error, request, reply) => {
    errorHandler(error, request, reply);
  });

  app.setNotFoundHandler((request, reply) => {
    notFoundHandler(request, reply);
  });

  app.register(AutoLoad, {
    dir: path.join(__dirname, 'services/'),
    dirNameRoutePrefix: false,
  });

  process.on('SIGINT', () => {
    app.close();

    console.log('fastify server stopped');
    process.exit(0);
  });

  return app;
};

start();

export default start;
