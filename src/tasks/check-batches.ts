import moment from 'moment';

import constants from '../constants.js';
import { blockfrostClient } from '../services/blockfrost.js';
import { store } from '../services/database.js';
import { composeMetadata, composeTransaction, signTransaction } from '../utils/tx.js';
import { getAccountKey, getUtxoKey, mnemonicToPrivateKey } from '../utils/keys.js';

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
      const documents = await store.getDocumentsForBatch(batch.uuid);

      // pin ipfs hashes after payment
      if (batch.pin_ipfs) {
        for (const doc of documents) {
          await blockfrostClient.pin(doc.ipfs_hash);
        }
      }

      const METADATA_LABEL = 1234;

      // Compose metadata
      const metadatum = composeMetadata(documents[0], METADATA_LABEL);

      // Fetch utxos
      const utxos = await blockfrostClient.getAddressUtxos(batch.address);

      if (utxos.length === 0) {
        await store.updateBatchStatus(batch.uuid, 'error');
      }

      const { txBody, txMetadata } = composeTransaction(
        batch.address, // address with utxo
        batch.address, // output address (also used as change)
        metadatum,
        utxos,
      );

      const privateKey = mnemonicToPrivateKey(constants.mnemonic);
      const accountKey = getAccountKey(privateKey);
      const signKey = getUtxoKey(accountKey, batch.address_index);
      const transaction = signTransaction(txBody, txMetadata, signKey.to_raw_key());

      await blockfrostClient.submitTx(transaction.to_bytes());

      await store.updateBatchStatus(batch.uuid, 'paid');
    }
  }
};
