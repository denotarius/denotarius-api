import { config as dotEnvConfig } from 'https://deno.land/x/dotenv@v1.0.1/mod.ts';

const config = dotEnvConfig({});

if (!config.PUBLIC_KEY) {
  throw Error('environment variable `PUBLIC_KEY` is not set');
}

if (!config.BLOCKFROST_MAINNET_TOKEN) {
  throw Error('environment variable `BLOCKFROST_MAINNET_TOKEN` is not set');
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
export const PUBLIC_KEY: string = config.PUBLIC_KEY;
export const IS_TESTNET = config.IS_TESTNET === 'true' ? true : false;
export const BLOCKFROST_MAINNET_TOKEN = config.BLOCKFROST_MAINNET_TOKEN;
export const BLOCKFROST_IPFS_TOKEN = config.BLOCKFROST_IPFS_TOKEN;
export const BLOCKFROST_MAINNET = 'https://cardano-testnet.blockfrost.io/api/v0';
