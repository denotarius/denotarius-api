import { config as dotEnvConfig } from 'https://deno.land/x/dotenv@v1.0.1/mod.ts';

const config = dotEnvConfig({});

if (!config.MNEMONIC) {
  throw Error('environment variable `MNEMONIC` is not set');
}

if (!config.BLOCKFROST_PROJECT_ID) {
  throw Error('environment variable `BLOCKFROST_PROJECT_ID` is not set');
}
if (!config.BLOCKFROST_NETWORK) {
  throw Error('environment variable `BLOCKFROST_NETWORK` is not set');
}

if (!config.BLOCKFROST_IPFS_TOKEN) {
  throw Error('environment variable `BLOCKFROST_IPFS_TOKEN` is not set');
}

export const VERSION = '1.0.0';
export const ROUTES = {
  STATUS_ROUTE: new URLPattern({ pathname: '/status' }),
  ROOT_ROUTE: new URLPattern({ pathname: '/' }),
  ATTESTATION_SUBMIT_ROUTE: new URLPattern({ pathname: '/attestation/submit' }),
  ATTESTATION_ORDER_ROUTE: new URLPattern({
    pathname: '/attestation/:order_id',
  }),
};
export const AMOUNT_TO_PAY_IN_LOVELACES = config.AMOUNT_TO_PAY_IN_LOVELACES
  ? Number(config.AMOUNT_TO_PAY_IN_LOVELACES)
  : 1000000;

export const ORDER_TIME_LIMIT_IN_SECONDS = 1800;
export const MNEMONIC: string = config.MNEMONIC;
export const IS_TESTNET = config.BLOCKFROST_NETWORK === 'mainnet' ? false : true;
export const BLOCKFROST_PROJECT_ID = config.BLOCKFROST_PROJECT_ID;
export const BLOCKFROST_NETWORK = config.BLOCKFROST_NETWORK;
export const BLOCKFROST_IPFS_TOKEN = config.BLOCKFROST_IPFS_TOKEN;
