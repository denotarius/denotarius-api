import { decodeString } from 'https://deno.land/std@0.63.0/encoding/hex.ts';
import { C, Core } from 'https://deno.land/x/lucid@0.6.0/mod.ts';

export const getDate = () => {
  const date = new Date();
  return date.toISOString();
};

const harden = (num: number): number => {
  return 0x80000000 + num;
};

export const deriveAddress = (
  // accountPublicKey: string,
  rootPrivKey: Core.Bip32PrivateKey,
  addressIndex: number,
  isTestnet: boolean,
) => {
  // const accountKey = C.Bip32PublicKey.from_bytes(decodeString(accountPublicKey));

  const accountPrvKey = rootPrivKey
    .derive(harden(1852)) // purpose
    .derive(harden(1815)) // coin type
    .derive(harden(0)); // account #0

  const utxoKey = accountPrvKey
    .derive(0) // external
    .derive(addressIndex);

  const stakeKey = accountPrvKey
    .derive(2) // chimeric
    .derive(0)
    .to_public();

  const testnetNetwork = C.NetworkInfo.testnet();
  const mainnetNetwork = C.NetworkInfo.mainnet();
  const networkId = isTestnet ? testnetNetwork.network_id() : mainnetNetwork.network_id();

  const utxoPubKeyHash = utxoKey.to_public().to_raw_key().hash();
  const stakeKeyHash = stakeKey.to_raw_key().hash();
  const utxoStakeCred = C.StakeCredential.from_keyhash(utxoPubKeyHash);
  const mainStakeCred = C.StakeCredential.from_keyhash(stakeKeyHash);
  const baseAddress = C.BaseAddress.new(
    networkId,
    utxoStakeCred,
    mainStakeCred,
  );

  const addr = baseAddress.to_address().to_bech32(undefined);

  return { signKey: utxoKey.to_raw_key(), address: addr };
};
