import {
  AuxiliaryData,
  hash_transaction,
  make_vkey_witness,
  PrivateKey,
  Transaction,
  TransactionBody,
  TransactionWitnessSet,
  Vkeywitnesses,
} from '@emurgo/cardano-serialization-lib-nodejs';

export const signTransaction = (
  txBody: TransactionBody,
  txMetadata: AuxiliaryData,
  signKey: PrivateKey,
): Transaction => {
  const txHash = hash_transaction(txBody);
  const witnesses = TransactionWitnessSet.new();
  const vkeyWitnesses = Vkeywitnesses.new();

  vkeyWitnesses.add(make_vkey_witness(txHash, signKey));
  witnesses.set_vkeys(vkeyWitnesses);

  // create the finalized transaction with witnesses
  const transaction = Transaction.new(txBody, witnesses, txMetadata);

  return transaction;
};
