import { FastifyInstance, FastifyRequest } from 'fastify';
import constants from '../constants.js';
import { deriveAddress } from '@blockfrost/blockfrost-js';
import { blockfrostClient } from '../services/blockfrost.js';
import { store } from '../services/database.js';
import { AttestationQueryParameters } from '../types/routes.js';
import { mnemonicToPrivateKey, getAccountKey, getXpub } from '../utils/keys.js';
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
      const addressIndex = await store.getBatchesCount();
      const privateKey = mnemonicToPrivateKey(constants.mnemonic);
      const accountKey = getAccountKey(privateKey);
      const xpub = getXpub(accountKey);
      const { address } = deriveAddress(
        xpub,
        1,
        addressIndex,
        blockfrostClient.api.projectId?.includes('testnet') || false,
      );
      const savedBatch = await store.saveBatch(request.body as any, addressIndex, address);
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
