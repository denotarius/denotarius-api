import config from 'config';
import { readFileSync } from 'fs';

if (!config.has('MNEMONIC')) {
  throw new Error('environment variable `MNEMONIC` is not set');
}

if (!config.has('BLOCKFROST_API_KEY')) {
  throw new Error('environment variable `BLOCKFROST_API_KEY` is not set');
}

if (!config.has('BLOCKFROST_IPFS_TOKEN')) {
  throw new Error('environment variable `BLOCKFROST_IPFS_TOKEN` is not set');
}

const amountToPayInLovelaces = config.get('AMOUNT_TO_PAY_IN_LOVELACES')
  ? Number(config.get('AMOUNT_TO_PAY_IN_LOVELACES'))
  : 1_000_000;

let pgConnectionString = '';

if (config.has('db.connectionString')) {
  pgConnectionString = config.get('db.connectionString');
} else {
  const filename: string = config.get('db.connectionStringFile');

  pgConnectionString = readFileSync(filename, 'utf8');
}

const pgMaxConnections: number = config.has('db.maxConnections')
  ? config.get('db.maxConnections')
  : 2;
const pgConnectionTimeoutMs: number = config.has('db.connectionTimeoutMs')
  ? config.get('db.connectionTimeoutMs')
  : 3000;
const pgIdleTimeoutMs: number = config.has('db.idleTimeoutMs')
  ? config.get('db.idleTimeoutMs')
  : 10_000;

const pgSsl: boolean | Record<string, unknown> = config.has('db.ssl')
  ? config.get('db.ssl')
  : {
      rejectUnauthorized: false,
    };

export default {
  blockforst: {
    apiKey: config.get<string>('BLOCKFROST_API_KEY'),
    ipfsKey: config.get<string>('BLOCKFROST_IPFS_TOKEN'),
  },
  orderLimitInSeconds: 1800,
  amountToPayInLovelaces,
  menmonic: config.get<string>('MNEMONIC'),
  db: {
    pgConnectionString,
    pgMaxConnections,
    pgConnectionTimeoutMs,
    pgIdleTimeoutMs,
    pgSsl,
  },
  cardano: {
    coinPerUtxoSize: 16_384,
    maxValueSize: 5000,
    maxTxSize: 16_384,
  },
} as const;
