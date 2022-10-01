import { fastifyAutoload } from '@fastify/autoload';
import fastify, { FastifyInstance } from 'fastify';
import { fastify as bfUtilsFastify } from '@blockfrost/blockfrost-utils';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const start = (options = {}): FastifyInstance => {
  const app = fastify(options);

  app.setErrorHandler((error, request, reply) => {
    void bfUtilsFastify.errorHandler(error, request, reply);
  });

  void app.register(fastifyAutoload, {
    dir: path.join(__dirname, 'routes'),
    dirNameRoutePrefix: false,
  });

  process.on('SIGINT', () => {
    void app.close();
    console.log('fastify server stopped');
    process.exit(0);
  });

  return app;
};

start();

export default start;
