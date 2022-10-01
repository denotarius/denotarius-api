import { Responses } from '@blockfrost/blockfrost-js';
import {
  Address,
  AuxiliaryData,
  BigNum,
  encode_json_str_to_metadatum,
  hash_transaction,
  LinearFee,
  make_vkey_witness,
  MetadataJsonSchema,
  PrivateKey,
  Transaction,
  TransactionBody,
  TransactionBuilder,
  TransactionBuilderConfigBuilder,
  TransactionHash,
  TransactionInput,
  TransactionMetadatum,
  TransactionOutput,
  TransactionUnspentOutput,
  TransactionUnspentOutputs,
  TransactionWitnessSet,
  Value,
  Vkeywitnesses,
} from '@emurgo/cardano-serialization-lib-nodejs';

import constants from '../constants.js';

export const composeMetadata = (data: unknown, metadataLabel: number): TransactionMetadatum => {
  const object = {
    [metadataLabel]: data,
  };

  try {
    const metadata = encode_json_str_to_metadatum(
      JSON.stringify(object),
      MetadataJsonSchema.BasicConversions,
    );

    return metadata;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to encode metadata.');
  }
};

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

export const composeTransaction = (
  address: string,
  outputAddress: string,
  // outputAmount: string,
  metadatum: TransactionMetadatum,
  utxos: Responses['address_utxo_content'],
  // currentSlot: number,
): {
  txHash: string;
  txBody: TransactionBody;
  txMetadata: AuxiliaryData;
} => {
  if (!utxos || utxos.length === 0) {
    throw new Error(`No utxo on address ${address}`);
  }

  const txBuilder = TransactionBuilder.new(
    TransactionBuilderConfigBuilder.new()
      .fee_algo(LinearFee.new(BigNum.from_str('44'), BigNum.from_str('155381')))
      .pool_deposit(BigNum.from_str('500000000'))
      .key_deposit(BigNum.from_str('2000000'))
      .coins_per_utxo_byte(BigNum.from_str(constants.cardano.coinPerUtxoSize.toString()))
      .max_value_size(constants.cardano.maxValueSize)
      .max_tx_size(constants.cardano.maxTxSize)
      .build(),
  );

  const outputAddr = Address.from_bech32(outputAddress);
  const changeAddr = Address.from_bech32(address);

  // Set TTL to +2h from currentSlot
  // If the transaction is not included in a block before that slot it will be cancelled.
  // const ttl = currentSlot + 7200;
  // txBuilder.set_ttl(BigNum.from_str(ttl.toString()));

  // Add output to the tx
  // txBuilder.add_output(
  //   TransactionOutput.new(
  //     outputAddr,
  //     Value.new(BigNum.from_str(outputAmount)),
  //   ),
  // );

  // set metadata
  const txMetadata = AuxiliaryData.from_bytes(metadatum.to_bytes());

  txBuilder.set_auxiliary_data(txMetadata);

  // Filter out multi asset utxo to keep this simple
  const lovelaceUtxos = utxos.filter((u: any) => !u.amount.some((a: any) => a.unit !== 'lovelace'));

  let utxoValue = BigNum.from_str('0');

  // Create TransactionUnspentOutputs from utxos fetched from Blockfrost
  const unspentOutputs = TransactionUnspentOutputs.new();

  for (const utxo of lovelaceUtxos) {
    const amount = utxo.amount.find((a: any) => a.unit === 'lovelace')?.quantity;

    if (!amount) continue;

    const inputValue = Value.new(BigNum.from_str(amount.toString()));

    const input = TransactionInput.new(
      TransactionHash.from_hex(utxo.tx_hash),
      //@ts-ignore
      BigNum.from_str(utxo.output_index.toString()),
    );
    const output = TransactionOutput.new(changeAddr, inputValue);

    unspentOutputs.add(TransactionUnspentOutput.new(input, output));
    //@ts-ignore
    txBuilder.add_input(TransactionUnspentOutput.new(input, output));
    utxoValue = utxoValue.checked_add(BigNum.from_str(amount.toString()));
  }

  // Adds a change output that will use all ada available in utxo minus the fee
  let txFee = txBuilder.min_fee();
  const fakeChangeOutput = TransactionOutput.new(outputAddr, Value.new(utxoValue));
  const changeOutputFee = txBuilder.fee_for_output(fakeChangeOutput);

  txFee = txFee.checked_add(changeOutputFee);
  const changeOutput = TransactionOutput.new(
    outputAddr,
    Value.new(utxoValue.clamped_sub(changeOutputFee)),
  );

  txBuilder.add_output(changeOutput);

  // Build transaction
  const txBody = txBuilder.build_tx().body();
  const txHash = hash_transaction(txBody).to_hex();

  return {
    txHash,
    txBody,
    txMetadata,
  };
};
