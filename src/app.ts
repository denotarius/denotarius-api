import { fastifyAutoload } from '@fastify/autoload';
import fastify, { FastifyInstance } from 'fastify';
import path from 'path';

const start = (options = {}): FastifyInstance => {
  const app = fastify(options);

  app.register(fastifyAutoload, {
    dir: path.join(__dirname, 'routes'),
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
