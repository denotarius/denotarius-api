import config from 'config';

if (!config.has('MNEMONIC')) {
  throw new Error('environment variable `MNEMONIC` is not set');
}

if (!config.has('BLOCKFROST_PROJECT_ID')) {
  throw new Error('environment variable `BLOCKFROST_PROJECT_ID` is not set');
}

if (!config.has('BLOCKFROST_NETWORK')) {
  throw new Error('environment variable `BLOCKFROST_NETWORK` is not set');
}

if (!config.has('BLOCKFROST_IPFS_TOKEN')) {
  throw new Error('environment variable `BLOCKFROST_IPFS_TOKEN` is not set');
}

export const AMOUNT_TO_PAY_IN_LOVELACES = config.get('AMOUNT_TO_PAY_IN_LOVELACES')
  ? Number(config.get('AMOUNT_TO_PAY_IN_LOVELACES'))
  : 1_000_000;

export const ORDER_TIME_LIMIT_IN_SECONDS = 1800;
export const MNEMONIC: string = config.MNEMONIC;
export const IS_TESTNET = config.BLOCKFROST_NETWORK === 'mainnet' ? false : true;
export const BLOCKFROST_PROJECT_ID = config.BLOCKFROST_PROJECT_ID;
export const BLOCKFROST_NETWORK = config.BLOCKFROST_NETWORK;
export const BLOCKFROST_IPFS_TOKEN = config.BLOCKFROST_IPFS_TOKEN;
