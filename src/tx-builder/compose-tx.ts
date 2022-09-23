import { C, Core } from 'https://deno.land/x/lucid@0.6.0/mod.ts';
import { UTXO } from '../types.ts';

export const CARDANO_PARAMS = {
  // COINS_PER_UTXO_WORD: '34482',
  COINS_PER_UTXO_BYTE: '4310',
  MAX_TX_SIZE: 16384,
  MAX_VALUE_SIZE: 5000,
} as const;

export const composeTransaction = (
  address: string,
  outputAddress: string,
  // outputAmount: string,
  metadatum: Core.TransactionMetadatum,
  utxos: UTXO[],
  // currentSlot: number,
): {
  txHash: string;
  txBody: Core.TransactionBody;
  txMetadata: Core.AuxiliaryData;
} => {
  if (!utxos || utxos.length === 0) {
    throw Error(`No utxo on address ${address}`);
  }

  const txBuilder = C.TransactionBuilder.new(
    C.TransactionBuilderConfigBuilder.new()
      .fee_algo(
        C.LinearFee.new(
          C.BigNum.from_str('44'),
          C.BigNum.from_str('155381'),
        ),
      )
      .pool_deposit(C.BigNum.from_str('500000000'))
      .key_deposit(C.BigNum.from_str('2000000'))
      .coins_per_utxo_byte(
        C.BigNum.from_str(CARDANO_PARAMS.COINS_PER_UTXO_BYTE),
      )
      .max_value_size(CARDANO_PARAMS.MAX_VALUE_SIZE)
      .max_tx_size(CARDANO_PARAMS.MAX_TX_SIZE)
      .build(),
  );

  const outputAddr = C.Address.from_bech32(outputAddress);
  const changeAddr = C.Address.from_bech32(address);

  // Set TTL to +2h from currentSlot
  // If the transaction is not included in a block before that slot it will be cancelled.
  // const ttl = currentSlot + 7200;
  // txBuilder.set_ttl(C.BigNum.from_str(ttl.toString()));

  // Add output to the tx
  // txBuilder.add_output(
  //   C.TransactionOutput.new(
  //     outputAddr,
  //     C.Value.new(C.BigNum.from_str(outputAmount)),
  //   ),
  // );

  // set metadata
  const txMetadata = C.AuxiliaryData.from_bytes(
    metadatum.to_bytes(),
  );
  txBuilder.set_auxiliary_data(txMetadata);

  // Filter out multi asset utxo to keep this simple
  const lovelaceUtxos = utxos.filter(
    (u: any) => !u.amount.find((a: any) => a.unit !== 'lovelace'),
  );

  let utxoValue = C.BigNum.from_str('0');

  // Create TransactionUnspentOutputs from utxos fetched from Blockfrost
  const unspentOutputs = C.TransactionUnspentOutputs.new();
  for (const utxo of lovelaceUtxos) {
    const amount = utxo.amount.find(
      (a: any) => a.unit === 'lovelace',
    )?.quantity;

    if (!amount) continue;

    const inputValue = C.Value.new(
      C.BigNum.from_str(amount.toString()),
    );

    const input = C.TransactionInput.new(
      C.TransactionHash.from_hex(utxo.tx_hash),
      C.BigNum.from_str(utxo.output_index.toString()),
    );
    const output = C.TransactionOutput.new(changeAddr, inputValue);
    unspentOutputs.add(C.TransactionUnspentOutput.new(input, output));
    txBuilder.add_input(
      C.TransactionUnspentOutput.new(input, output),
      undefined,
    );
    utxoValue = utxoValue.checked_add(C.BigNum.from_str(amount.toString()));
  }

  // Adds a change output that will use all ada available in utxo minus the fee
  let txFee = txBuilder.min_fee();
  const fakeChangeOutput = C.TransactionOutput.new(outputAddr, C.Value.new(utxoValue));
  const changeOutputFee = txBuilder.fee_for_output(fakeChangeOutput);
  txFee = txFee.checked_add(changeOutputFee);
  const changeOutput = C.TransactionOutput.new(
    outputAddr,
    C.Value.new(utxoValue.clamped_sub(changeOutputFee)),
  );
  txBuilder.add_output(changeOutput);

  // Build transaction
  const txBody = txBuilder.build_tx().body();
  const txHash = C.hash_transaction(txBody).to_hex();

  return {
    txHash,
    txBody,
    txMetadata,
  };
};
