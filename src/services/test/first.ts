import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

async function accounts(fastify: FastifyInstance) {
  fastify.route({
    url: '/a',
    method: 'GET',
    handler: async (_request: FastifyRequest, reply: FastifyReply) => {
      return reply.send('a');
    },
  });
}

module.exports = accounts;
