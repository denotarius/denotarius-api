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

export const getAccountKey = (privateKey: Bip32PrivateKey) => {
  return privateKey.derive(harden(1852)).derive(harden(1815)).derive(harden(0));
};

export const getUtxoKey = (accountKey: Bip32PrivateKey, addressIndex: number) => {
  return accountKey.derive(0).derive(addressIndex);
};

export const getXpub = (accountKey: Bip32PrivateKey) => {
  return Buffer.from(accountKey.to_public().as_bytes()).toString('hex');
};
