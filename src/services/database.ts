import { deriveAddress } from '@blockfrost/blockfrost-js';
import { Bip32PrivateKey } from '@emurgo/cardano-serialization-lib-nodejs';
import pgLib from 'pg-promise';
import pg from 'pg-promise/typescript/pg-subset.js';

import constants from '../constants.js';
import { AttestationSumbitInput } from '../types/routes.js';
import { getDate } from '../utils/index.js';

import type { Batch } from '../types/tables';
import type { Status } from '../types/common';

const pgp = pgLib({});

export const db = pgp({
  connectionString: constants.db.pgConnectionString,
  // maximum number of clients the pool should contain
  // by default this is set to 10.
  max: constants.db.pgMaxConnections,
  // number of milliseconds to wait before timing out when connecting a new client
  // by default this is 0 which means no timeout
  connectionTimeoutMillis: constants.db.pgConnectionTimeoutMs,
  // number of milliseconds a client must sit idle in the pool and not be checked out
  // before it is disconnected from the backend and discarded
  // default is 10000 (10 seconds) - set to 0 to disable auto-disconnection of idle clients
  idleTimeoutMillis: constants.db.pgIdleTimeoutMs,
  ssl: constants.db.pgSsl,
});

class Store {
  db: pgLib.IDatabase<unknown, pg.IClient>;

  // eslint-disable-next-line @typescript-eslint/ban-types
  constructor(database: pgLib.IDatabase<{}, pg.IClient>) {
    this.db = database;
  }

  init = async () => {
    await this.createTables();
  };

  createTables = async () => {
    await this.db.query(
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

    await this.db.query(
      `CREATE TABLE IF NOT EXISTS document (
          ipfs_hash TEXT NOT NULL,
          metadata TEXT,
          uuid TEXT, 
          FOREIGN KEY(uuid) REFERENCES batch(uuid)
        )`,
    );
  };

  saveBatch = async (input: AttestationSumbitInput, prvKey: Bip32PrivateKey) => {
    // const columnSet = new pgp.helpers.ColumnSet(
    //   [
    //     'uuid',
    //     'created_at',
    //     'status',
    //     'amount',
    //     'address',
    //     'address_index',
    //     'order_time_limit_in_seconds',
    //     'pin_ipfs',
    //   ],
    //   {
    //     table: 'batch',
    //   },
    // );

    const createdAt = getDate();
    const uuid = crypto.randomUUID();
    const addressIndex = this.getBatchesCount();
    // @ts-ignore
    const { address } = deriveAddress(prvKey, 2, addressIndex, IS_TESTNET);

    await this.db.one(
      'INSERT INTO batch (uuid, created_at, status, amount, address, address_index, order_time_limit_in_seconds, pin_ipfs) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        uuid,
        createdAt,
        'unpaid',
        constants.amountToPayInLovelaces,
        address,
        addressIndex,
        constants.orderLimitInSeconds,
        input.pin_ipfs,
      ],
    );

    for (const row of input.ipfs) {
      await this.db.query('INSERT INTO document (ipfs_hash, metadata, uuid) VALUES (?, ?, ?)', [
        row.cid,
        row.metadata,
        uuid,
      ]);
    }
    // @ts-ignore
    return { address, metadata: input, signKey };
  };

  getBatch = async (orderId: string): Promise<Batch | null> => {
    const batch = await this.db.oneOrNone<Batch>('SELECT * FROM batch WHERE uuid = $1', [orderId]);

    return batch;
  };

  getActiveBatches = async () => {
    const rows = await this.db.manyOrNone<Batch>(`SELECT * FROM batch where status = 'unpaid'`);

    return rows;
  };

  updateBatchStatus = async (id: string, status: Status) => {
    await this.db.query('UPDATE batch SET status = $1 where uuid = $2', [status, id]);
  };

  getBatchesCount = async (): Promise<number> => {
    const row = await this.db.one<number>('SELECT count(*) FROM batch');

    return row;
  };
}

export const store = new Store(db);
