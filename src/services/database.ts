import pgLib from 'pg-promise';
import pg from 'pg-promise/typescript/pg-subset.js';
import constants from '../constants.js';
import { AttestationSumbitInput } from '../types/routes.js';
import type { Batch, Doc } from '../types/tables';
import type { Status } from '../types/common';
import { validate } from 'uuid';

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
          uuid UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
          status TEXT NOT NULL,
          amount BIGINT NOT NULL,
          address TEXT NOT NULL,
          address_index BIGINT NOT NULL,
          order_time_limit_in_seconds INT NOT NULL,
          pin_ipfs BOOL DEFAULT FALSE NOT NULL,
          tx_hash TEXT
        )`,
    );

    await this.db.query(
      `CREATE TABLE IF NOT EXISTS document (
          batch_id UUID,
          ipfs_hash TEXT NOT NULL,
          metadata TEXT,
          FOREIGN KEY(batch_id) REFERENCES batch(uuid)
        )`,
    );
  };

  saveBatch = async (input: AttestationSumbitInput, addressIndex: number, address: string) => {
    const documentColumns = new pgp.helpers.ColumnSet(['batch_id', 'metadata', 'ipfs_hash'], {
      table: 'document',
    });

    const batchColumns = new pgp.helpers.ColumnSet(
      ['status', 'amount', 'address', 'address_index', 'order_time_limit_in_seconds', 'pin_ipfs'],
      { table: 'batch' },
    );
    const batchColumnSet = batchColumns;
    const insertBatchQuery =
      pgp.helpers.insert(
        [
          {
            status: 'unpaid',
            amount: constants.cardano.amountToPayInLovelaces,
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
        batch_id: insertedBatch.uuid,
        metadata: row.metadata,
        ipfs_hash: row.cid,
      });
    }

    const insertDocQuery = pgp.helpers.insert(documents, documentColumnSet);
    await this.db.none(insertDocQuery);

    return {
      batchId: insertedBatch.uuid,
      address,
      metadata: input,
    };
  };

  getBatch = async (orderId: string): Promise<Batch | null> => {
    if (validate(orderId)) {
      const batch = await this.db.oneOrNone<Batch>('SELECT * FROM batch WHERE uuid = $1', [
        orderId,
      ]);

      return batch;
    }

    return null;
  };

  getActiveBatches = async () => {
    const rows = await this.db.manyOrNone<Batch>(`SELECT * FROM batch WHERE status = 'unpaid'`);

    return rows;
  };

  updateBatchStatus = async (id: string, status: Status) => {
    await this.db.query('UPDATE batch SET status = $1 WHERE uuid = $2', [status, id]);
  };

  getBatchesCount = async (): Promise<number> => {
    const row = await this.db.one<{ count: number }>('SELECT count(*) FROM batch');

    return row.count;
  };

  getDocumentsForBatch = async (uuid: string) => {
    const row = await this.db.many<Doc>('SELECT * FROM document WHERE batch_id = $1', [uuid]);

    return row;
  };

  storeTxHash = async (id: string, txHash: string) => {
    await this.db.query('UPDATE batch SET tx_hash = $1 WHERE uuid = $2', [txHash, id]);
  };
}

export const store = new Store(db);
