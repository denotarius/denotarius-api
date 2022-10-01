import { deriveAddress } from '@blockfrost/blockfrost-js';
import pgLib from 'pg-promise';
import crypto from 'crypto';
import pg from 'pg-promise/typescript/pg-subset.js';
import constants from '../constants.js';
import { AttestationSumbitInput } from '../types/routes.js';
import { getDate } from '../utils/index.js';
import type { Batch, Doc } from '../types/tables';
import type { Status } from '../types/common';
import { Bip32PrivateKey } from '@emurgo/cardano-serialization-lib-nodejs';
import { blockfrostClient } from './blockfrost.js';

export const pgp = pgLib({});

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
          id SERIAL PRIMARY KEY,
          uuid VARCHAR NOT NULL,
          created_at VARCHAR NOT NULL,
          status VARCHAR NOT NULL,
          amount INT NOT NULL,
          address VARCHAR NOT NULL,
          address_index INT NOT NULL,
          order_time_limit_in_seconds INT NOT NULL,
          pin_ipfs BOOL NOT NULL
        )`,
    );

    await this.db.query(
      `CREATE TABLE IF NOT EXISTS document (
          id SERIAL PRIMARY KEY,
          ipfs_hash VARCHAR NOT NULL,
          metadata TEXT,
          uuid VARCHAR NOT NULL UNIQUE, 
          FOREIGN KEY(id) REFERENCES batch(id)
        )`,
    );
  };

  saveBatch = async (input: AttestationSumbitInput, prvKey: Bip32PrivateKey) => {
    const documentColumns = new pgp.helpers.ColumnSet(['id', 'uuid', 'metadata', 'ipfs_hash'], {
      table: 'document',
    });

    const batchColumns = new pgp.helpers.ColumnSet(
      [
        'id',
        'uuid',
        'created_at',
        'status',
        'amount',
        'address',
        'address_index',
        'order_time_limit_in_seconds',
        'pin_ipfs',
      ],
      {
        table: 'batch',
      },
    );

    const createdAt = getDate();
    const uuid = crypto.randomUUID();
    const addressIndex = await this.getBatchesCount();
    const { address } = deriveAddress(
      prvKey.to_bech32(),
      2,
      addressIndex,
      blockfrostClient.api.projectId?.includes('testnet') || false,
    );

    const batchColumnSet = batchColumns;
    const insertBatchQuery =
      pgp.helpers.insert(
        [
          {
            uuid: uuid,
            created_at: createdAt,
            status: 'unpaid',
            amount: constants.amountToPayInLovelaces,
            address: address,
            address_index: addressIndex,
            order_time_limit_in_seconds: constants.orderLimitInSeconds,
            pin_ipfs: input.pin_ipfs,
          },
        ],
        batchColumnSet,
      ) + ' RETURNING *';

    const insertedBatch = await this.db.one<Batch>(insertBatchQuery);
    const documentColumnSet = documentColumns;
    const documents: Doc[] = [];

    for (const row of input.ipfs) {
      documents.push({
        id: insertedBatch.id,
        uuid: uuid,
        metadata: row.metadata,
        ipfs_hash: row.cid,
      });
    }

    const insertDocQuery = pgp.helpers.insert(documents, documentColumnSet);
    await this.db.none(insertDocQuery);

    return { address, metadata: input, prvKey };
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

  getDocumentsForBatch = async (uuid: string) => {
    const row = await this.db.many<Doc>('SELECT * FROM document where uuid = $1', [uuid]);

    return row;
  };
}

export const store = new Store(db);
