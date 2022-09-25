import { Core } from 'https://deno.land/x/lucid@0.6.0/mod.ts';
import { DB } from 'https://deno.land/x/sqlite@v3.5.0/mod.ts';

import {
  AMOUNT_TO_PAY_IN_LOVELACES,
  IS_TESTNET,
  ORDER_TIME_LIMIT_IN_SECONDS,
} from './constants.ts';
import { AttestationSumbitInput, Batch, Status } from './types.ts';
import { deriveAddress, getDate } from './utils.ts';

const database = new DB('denotarius.db');

export const initDatabase = () => {
  database.execute(
    `CREATE TABLE IF NOT EXISTS batch (
        uuid TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        status INTEGER NOT NULL,
        amount INT NOT NULL,
        address TEXT NOT NULL,
        address_index TEXT NOT NULL,
        order_time_limit_in_seconds INT NOT NULL,
        pin_ipfs BOOL NOT NULL
      )`,
  );

  database.execute(
    `CREATE TABLE IF NOT EXISTS document (
        ipfs_hash TEXT NOT NULL,
        metadata TEXT,
        uuid TEXT, 
        FOREIGN KEY(uuid) REFERENCES batch(uuid)
      )`,
  );
};

export const saveBatch = (input: AttestationSumbitInput, prvKey: Core.Bip32PrivateKey) => {
  const createdAt = getDate();
  const uuid = crypto.randomUUID();
  const addressIndex = getBatchesCount();
  const { address, signKey } = deriveAddress(prvKey, addressIndex, IS_TESTNET);

  database.query(
    'INSERT INTO batch (uuid, created_at, status, amount, address, address_index, order_time_limit_in_seconds, pin_ipfs) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      uuid,
      createdAt,
      'unpaid',
      AMOUNT_TO_PAY_IN_LOVELACES,
      address,
      addressIndex,
      ORDER_TIME_LIMIT_IN_SECONDS,
      input.pin_ipfs,
    ],
  );

  for (const row of input.ipfs) {
    database.query('INSERT INTO document (ipfs_hash, metadata, uuid) VALUES (?, ?, ?)', [
      row.cid,
      row.metadata,
      uuid,
    ]);
  }
  return { address, metadata: input, signKey };
};

export const getBatch = (uuid: string) => {
  const rows = database.queryEntries('SELECT * FROM batch WHERE uuid = ?', [uuid]);

  if (rows.length > 0) {
    return rows[0];
  }

  return;
};

export const updateBatchStatus = (id: string, status: Status) => {
  database.query('UPDATE batch SET status = (?) where uuid = (?)', [status, id]);
};

export const getBatchesCount = (): number => {
  const rows = database.query<[number]>('SELECT count(*) FROM batch');

  return rows[0][0];
};

export const getActiveBatches = () => {
  const rows = database.queryEntries<Batch>(`SELECT * FROM batch where status = 'unpaid'`);

  return rows;
};
