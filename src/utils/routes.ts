import { Batch } from '../types/tables.js';

export const parseBatch = (batch: Batch) => {
  return {
    order_id: batch.uuid,
    payment: {
      address: batch.address,
      amount: batch.amount,
    },
    status: batch.status,
    orderTimeLeftInSeconds: batch.order_time_limit_in_seconds,
    tx_hash: batch.tx_hash,
  };
};

export const isTestnet = (projectId?: string) => {
  if (!projectId) return false;

  if (
    projectId.includes('testnet') ||
    projectId.includes('preview') ||
    projectId.includes('preprod')
  ) {
    return true;
  }

  return false;
};
