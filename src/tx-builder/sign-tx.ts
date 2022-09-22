import { C, Core } from 'https://deno.land/x/lucid@0.6.0/mod.ts';

export const signTransaction = (
  txBody: Core.TransactionBody,
  txMetadata: Core.AuxiliaryData,
  signKey: Core.PrivateKey,
): Core.Transaction => {
  const txHash = C.hash_transaction(txBody);
  const witnesses = C.TransactionWitnessSet.new();
  const vkeyWitnesses = C.Vkeywitnesses.new();
  vkeyWitnesses.add(C.make_vkey_witness(txHash, signKey));
  witnesses.set_vkeys(vkeyWitnesses);

  // create the finalized transaction with witnesses
  const transaction = C.Transaction.new(
    txBody,
    witnesses,
    txMetadata,
  );

  return transaction;
};
