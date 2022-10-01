import moment from 'moment';

import constants from '../constants.js';
import { blockfrostClient } from '../services/blockfrost.js';
import { store } from '../services/database.js';

export default async () => {
  const activebatches = await store.getActiveBatches();

  for (const batch of activebatches) {
    // expire unpaid batches
    const momentNow = moment(new Date());
    const momentCreated = moment(batch.created_at);
    const differenceInSeconds = momentNow.diff(momentCreated, 'seconds');

    if (differenceInSeconds >= batch.order_time_limit_in_seconds) {
      await store.updateBatchStatus(batch.uuid, 'expired');
    }

    // check payments
    const addressBalance = await blockfrostClient.getAddressBalance(batch.address);

    if (!addressBalance) {
      console.error('Cannot get balance for address', batch.address);
      return;
    }

    if (addressBalance >= constants.amountToPayInLovelaces) {
      // pin ipfs hashes after payment
      if (batch.pin_ipfs) {
        const documents = await store.getDocumentsForBatch(batch.uuid);

        for (const doc of documents) {
          await blockfrostClient.pin(doc.ipfs_hash);
        }
      }

      await store.updateBatchStatus(batch.uuid, 'paid');
    }
  }
};
