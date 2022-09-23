import { decodeString } from 'https://deno.land/std@0.63.0/encoding/hex.ts';
import { C, Core } from 'https://deno.land/x/lucid@0.6.0/mod.ts';
import { mnemonicToEntropy } from 'https://esm.sh/bip39@3.0.4';

export const mnemonicToPrivateKey = (
  mnemonic: string,
): Core.Bip32PrivateKey => {
  const entropy = mnemonicToEntropy(mnemonic);

  const rootKey = C.Bip32PrivateKey.from_bip39_entropy(
    decodeString(entropy),
    decodeString(''),
  );

  return rootKey;
};
