import { FastifyInstance, FastifyRequest } from 'fastify';
import constants from '../constants.js';
import { store } from '../services/database.js';
import { AttestationQueryParameters } from '../types/routes.js';
import { mnemonicToPrivateKey } from '../utils/keys.js';
import { parseBatch } from '../utils/routes.js';

async function attestation(fastify: FastifyInstance) {
  fastify.route({
    url: '/attestation/:order_id',
    method: 'GET',
    handler: async (request: FastifyRequest<AttestationQueryParameters>, reply) => {
      const batch = await store.getBatch(request.params.order_id);

      if (batch) {
        const parsedBatch = parseBatch(batch);
        return reply.send(parsedBatch);
      }

      return reply.code(404).send('Not Found');
    },
  });

  fastify.route({
    url: '/attestation/submit',
    method: 'POST',
    handler: async (request: FastifyRequest<AttestationQueryParameters>, reply) => {
      const privateKey = mnemonicToPrivateKey(constants.mnemonic);
      const savedBatch = await store.saveBatch(request.body as any, privateKey);
      const batch = await store.getBatch(savedBatch.batchUuid);

      if (batch) {
        const parsedBatch = parseBatch(batch);
        return reply.send(parsedBatch);
      }

      return reply.code(404).send('Not Found');
    },
  });
}

export default attestation;
