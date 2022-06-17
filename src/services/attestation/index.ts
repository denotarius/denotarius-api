import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { pipeline } from 'stream';
import { createWriteStream } from 'fs';
import { promisify } from 'util';
import { generateChecksum } from '../../utils/files';

const pump = promisify(pipeline);

async function attestation(fastify: FastifyInstance) {
  fastify.route({
    url: '/attestation/submit',
    method: 'POST',
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const data = await request.file();
      const fileBuffer = await data.toBuffer();

      await pump(data.file, createWriteStream(data.filename));
      const checksum = generateChecksum(fileBuffer);

      reply.send(checksum);
    },
  });
}

module.exports = attestation;
