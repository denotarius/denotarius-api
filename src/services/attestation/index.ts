import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { pipeline } from 'stream';
import { createWriteStream } from 'fs';
import { promisify } from 'util';

const pump = promisify(pipeline);

async function attestation(fastify: FastifyInstance) {
  fastify.route({
    url: '/attestation/submit',
    method: 'POST',
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const data = await request.file();

      await pump(data.file, createWriteStream(data.filename));

      reply.send({ data: data.fieldname });
    },
  });
}

module.exports = attestation;
