import config from 'config';
import { readFileSync } from 'fs';

if (!config.has('mnemonic')) {
  throw new Error('config variable `mnemonic` is not set');
}

if (!config.has('blockfrost.apiKey')) {
  throw new Error('config variable `blockfrost.apiKey` is not set');
}

if (!config.has('blockfrost.ipfsKey')) {
  throw new Error('config variable `blockfrost.ipfsKey` is not set');
}

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
  orderLimitInSeconds: 1800,
  mnemonic: config.get<string>('mnemonic'),
  blockfrost: {
    apiKey: config.get<string>('blockfrost.apiKey'),
    ipfsKey: config.get<string>('blockfrost.ipfsKey'),
  },
  db: {
    pgConnectionString,
    pgMaxConnections,
    pgConnectionTimeoutMs,
    pgIdleTimeoutMs,
    pgSsl,
  },
  cardano: {
    metadataLabel: config.has('cardano.metadataLabel')
      ? config.get<'string'>('cardano.metadataLabel')
      : 1234,
    amountToPayInLovelaces: config.get('amountToPayInLovelaces')
      ? Number(config.get('amountToPayInLovelaces'))
      : 1_000_0000,
    coinPerUtxoSize: 16_384,
    maxValueSize: 5000,
    maxTxSize: 16_384,
  },
} as const;
