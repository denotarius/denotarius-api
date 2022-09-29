import { Status } from './common.js';

export type Batch = {
  uuid: string;
  created_at: string;
  status: Status;
  amount: string;
  address: string;
  address_index: number;
  order_time_limit_in_seconds: number;
  pin_ipfs: boolean;
};

export interface Document {
  a: string;
}
