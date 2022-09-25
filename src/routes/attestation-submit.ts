import { MNEMONIC } from '../constants.ts';
import { saveBatch } from '../database.ts';
import { blockfrostClient } from '../libs/blockfrost.ts';
import { composeMetadata } from '../tx-builder/compose-metadata.ts';
import { composeTransaction } from '../tx-builder/compose-tx.ts';
import { mnemonicToPrivateKey } from '../tx-builder/mnemonic.ts';
import { signTransaction } from '../tx-builder/sign-tx.ts';
import { AttestationSumbitInput } from '../types.ts';

const prvKey = mnemonicToPrivateKey(MNEMONIC);

const submit = async (data: AttestationSumbitInput) => {
  const savedBatch = saveBatch(data, prvKey);

  console.log('send money here', savedBatch.address);

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

  return Response.json({ txHash: txHash });
};

export default submit;
