import { Bip32PrivateKey } from '@emurgo/cardano-serialization-lib-nodejs';
import { mnemonicToEntropy } from 'bip39';

export const harden = (num: number): number => {
  return 0x80000000 + num;
};

export const mnemonicToPrivateKey = (mnemonic: string): Bip32PrivateKey => {
  const entropy = mnemonicToEntropy(mnemonic);
  const rootKey = Bip32PrivateKey.from_bip39_entropy(Buffer.from(entropy, 'hex'), Buffer.from(''));

  return rootKey;
};
