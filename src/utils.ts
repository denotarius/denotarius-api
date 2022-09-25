import {
  BaseAddress,
  Bip32PrivateKey,
  NetworkInfo,
  StakeCredential,
} from '@emurgo/cardano-serialization-lib-nodejs';

export const getDate = () => {
  const date = new Date();

  return date.toISOString();
};

const harden = (number_: number): number => {
  return 0x80_00_00_00 + number_;
};

export const deriveAddress = (
  // accountPublicKey: string,
  rootPrivKey: Bip32PrivateKey,
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

  const testnetNetwork = NetworkInfo.testnet();
  const mainnetNetwork = NetworkInfo.mainnet();
  const networkId = isTestnet ? testnetNetwork.network_id() : mainnetNetwork.network_id();

  const utxoPubKeyHash = utxoKey.to_public().to_raw_key().hash();
  const stakeKeyHash = stakeKey.to_raw_key().hash();
  const utxoStakeCred = StakeCredential.from_keyhash(utxoPubKeyHash);
  const mainStakeCred = StakeCredential.from_keyhash(stakeKeyHash);
  const baseAddress = BaseAddress.new(networkId, utxoStakeCred, mainStakeCred);

  const addr = baseAddress.to_address().to_bech32();

  return { signKey: utxoKey.to_raw_key(), address: addr };
};
