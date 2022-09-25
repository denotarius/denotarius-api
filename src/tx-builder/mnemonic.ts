import { Bip32PrivateKey } from '@emurgo/cardano-serialization-lib-nodejs';
import { decodeString } from 'https://deno.land/std@0.63.0/encoding/hex.ts';
import { mnemonicToEntropy } from 'https://esm.sh/bip39@3.0.4';

export const mnemonicToPrivateKey = (mnemonic: string): Bip32PrivateKey => {
  const entropy = mnemonicToEntropy(mnemonic);

  const rootKey = Bip32PrivateKey.from_bip39_entropy(decodeString(entropy), decodeString(''));

  return rootKey;
};
