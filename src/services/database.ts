import pgLib from 'pg-promise';
import crypto from 'crypto';
import pg from 'pg-promise/typescript/pg-subset.js';
import constants from '../constants.js';
import { AttestationSumbitInput } from '../types/routes.js';
import { getDate } from '../utils/common.js';
import type { Batch, Doc } from '../types/tables';
import type { Status } from '../types/common';

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
          batch_id INT NOT NULL,
          ipfs_hash VARCHAR NOT NULL,
          metadata TEXT,
          uuid VARCHAR NOT NULL UNIQUE, 
          FOREIGN KEY(batch_id) REFERENCES batch(id)
        )`,
    );
  };

  saveBatch = async (input: AttestationSumbitInput, addressIndex: number, address: string) => {
    const documentColumns = new pgp.helpers.ColumnSet(
      ['batch_id', 'uuid', 'metadata', 'ipfs_hash'],
      {
        table: 'document',
      },
    );

    const batchColumns = new pgp.helpers.ColumnSet(
      [
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
    const batchUuid = crypto.randomUUID();
    const batchColumnSet = batchColumns;
    const insertBatchQuery =
      pgp.helpers.insert(
        [
          {
            uuid: batchUuid,
            created_at: getDate(),
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
        batch_id: insertedBatch.id,
        uuid: crypto.randomUUID(),
        metadata: row.metadata,
        ipfs_hash: row.cid,
      });
    }

    const insertDocQuery = pgp.helpers.insert(documents, documentColumnSet);
    await this.db.none(insertDocQuery);

    return {
      batchUuid,
      address,
      metadata: input,
    };
  };

  getBatch = async (orderId: string): Promise<Batch | null> => {
    const batch = await this.db.oneOrNone<Batch>('SELECT * FROM batch WHERE uuid = $1', [orderId]);

    return batch;
  };

  getActiveBatches = async () => {
    const rows = await this.db.manyOrNone<Batch>(
      `SELECT * FROM batch WHERE status = 'unpaid' AND status != 'error'`,
    );

    return rows;
  };

  updateBatchStatus = async (id: string, status: Status) => {
    await this.db.query('UPDATE batch SET status = $1 WHERE uuid = $2', [status, id]);
  };

  getBatchesCount = async (): Promise<number> => {
    const row = await this.db.one<{ count: number }>('SELECT count(*) FROM batch');

    return row.count;
  };

  getDocumentsForBatch = async (id: string) => {
    const row = await this.db.many<Doc>('SELECT * FROM document WHERE id = $1', [id]);

    return row;
  };
}

export const store = new Store(db);
