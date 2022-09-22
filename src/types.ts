export interface AttestationSumbitInput {
  ipfs: {
    cid: string;
    metadata?: string;
  }[];
  pin_ipfs: boolean;
}

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

export type Status = 'paid' | 'unpaid' | 'expired';

export interface AddressBlockfrostResponse {
  address: string;
  amount: {
    unit: string;
    quantity: string;
  }[];
  stake_address: string | null;
  type: 'byron' | 'shelley';
  script: boolean;
}
