import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const start = (options = {}): FastifyInstance => {
  const app = fastify(options);

  app.route({
    method: 'GET',
    url: '/',
    handler: (_request: FastifyRequest, reply: FastifyReply) => {
      reply.send({
        status: 'https://denotarius.io/',
      });
    },
  });

  app.route({
    method: 'GET',
    url: '/status',
    handler: (_request: FastifyRequest, reply: FastifyReply) => {
      reply.send({
        healthy: true,
        version: `${packageJson.version}`,
      });
    },
  });

  app.route({
    method: 'GET',
    url: '/attestation/submit',
    handler: (_request: FastifyRequest, reply: FastifyReply) => {
      reply.send({
        healthy: true,
      });
    },
  });

  app.route({
    method: 'GET',
    url: '/attestation/:order_id',
    handler: (_request: FastifyRequest, reply: FastifyReply) => {
      reply.send({
        healthy: true,
      });
    },
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
