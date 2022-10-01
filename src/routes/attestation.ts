import { FastifyInstance, FastifyRequest } from 'fastify';
import constants from '../constants.js';
import { blockfrostClient } from '../services/blockfrost.js';
import { store } from '../services/database.js';
import { AttestationQueryParameters } from '../types/routes.js';
import {
  composeMetadata,
  composeTransaction,
  mnemonicToPrivateKey,
  signTransaction,
} from '../utils/index.js';

async function attestation(fastify: FastifyInstance) {
  fastify.route({
    url: '/attestation/:order_id',
    method: 'GET',
    handler: async (request: FastifyRequest<AttestationQueryParameters>, reply) => {
      const attestation = await store.getBatch(request.params.order_id);

      if (attestation) {
        return reply.send({
          order_id: attestation.uuid,
          payment: {
            address: attestation.address,
            amount: attestation.amount,
          },
          status: attestation.status,
          orderTimeLeftInSeconds: attestation.order_time_limit_in_seconds,
        });
      }

      return reply.code(404).send('Not Found');
    },
  });

  fastify.route({
    url: '/attestation/submit',
    method: 'POST',
    handler: async (request: FastifyRequest<AttestationQueryParameters>) => {
      const privateKey = mnemonicToPrivateKey(constants.mnemonic);
      const savedBatch = await store.saveBatch(request.body as any, privateKey);
      const METADATA_LABEL = 1234;

      // Compose metadata
      const metadatum = composeMetadata(savedBatch.metadata.ipfs, METADATA_LABEL);

      // Fetch utxos
      const utxos = await blockfrostClient.getAddressUtxos(savedBatch.address);

      if (utxos.length === 0) {
        throw new Error('No utxo found!');
      }

      const { txHash, txBody, txMetadata } = composeTransaction(
        savedBatch.address, // address with utxo
        savedBatch.address, // output address (also used as change)
        metadatum,
        utxos,
      );

      const transaction = signTransaction(txBody, txMetadata, savedBatch.signKey);

      await blockfrostClient.submitTx(transaction.to_bytes());

      return txHash;
    },
  });
}

export default attestation;
