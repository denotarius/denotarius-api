import { Status } from './common.js';

export type Batch = {
  id: number;
  uuid: string;
  created_at: string;
  status: Status;
  amount: string;
  address: string;
  address_index: number;
  order_time_limit_in_seconds: number;
  pin_ipfs: boolean;
  tx_hash?: string;
};

export interface Doc {
  batch_id: string;
  ipfs_hash: string;
  metadata?: string;
}
