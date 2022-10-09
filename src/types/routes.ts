import { Status } from './common.js';

export interface AttestationQueryParameters {
  Params: {
    order_id: string;
  };
  Body: AttestationSumbitInput;
}

export interface AttestationSubmitQueryParameters {
  Body: AttestationSumbitInput;
}

export interface AttestationSubmit {
  Params: {
    order_id: string;
  };
}

export interface AttestationSumbitInput {
  ipfs: {
    cid: string;
    metadata?: string;
  }[];
  pin_ipfs: boolean;
}

export interface AttestationSubmitResponse {
  order_id: string;
  payment: {
    address: string;
    amount: string;
  };
  status: Status;
  orderTimeLeftInSeconds: number;
}
