import { decodeString } from 'https://deno.land/std@0.63.0/encoding/hex.ts';
import { C } from 'https://deno.land/x/lucid@0.6.0/mod.ts';

export const getDate = () => {
  const date = new Date();
  return date.toISOString();
};

export const deriveAddress = (
  accountPublicKey: string,
  addressIndex: number,
  isTestnet: boolean,
): string => {
  const accountKey = C.Bip32PublicKey.from_bytes(decodeString(accountPublicKey));
  const utxoPubKey = accountKey.derive(0).derive(addressIndex);
  const mainStakeKey = accountKey.derive(2).derive(0);
  const testnetNetworkInfo = C.NetworkInfo.testnet();
  const mainnetNetworkInfo = C.NetworkInfo.mainnet();
  const networkId = isTestnet ? testnetNetworkInfo.network_id() : mainnetNetworkInfo.network_id();
  const utxoPubKeyHash = utxoPubKey.to_raw_key().hash();
  const mainStakeKeyHash = mainStakeKey.to_raw_key().hash();
  const utxoStakeCred = C.StakeCredential.from_keyhash(utxoPubKeyHash);
  const mainStakeCred = C.StakeCredential.from_keyhash(mainStakeKeyHash);
  const baseAddr = C.BaseAddress.new(networkId, utxoStakeCred, mainStakeCred);

  utxoStakeCred.free();
  mainStakeCred.free();
  mainStakeKeyHash.free();
  utxoPubKeyHash.free();

  const baseAddrBech32 = baseAddr.to_address().to_bech32(undefined);
  baseAddr.free();

  mainStakeKey.free();
  utxoPubKey.free();
  accountKey.free();

  testnetNetworkInfo.free();
  mainnetNetworkInfo.free();

  return baseAddrBech32;
};
