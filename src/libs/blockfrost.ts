import { Responses } from '@blockfrost/blockfrost-js';

import { BLOCKFROST_NETWORK, BLOCKFROST_PROJECT_ID } from '../constants.ts';

export class BlockfrostClient {
  projectId: string;
  network: string;
  customBackend: string | undefined;
  baseUrl: string;
  constructor(projectId: string, network: string, customBackend?: string) {
    this.projectId = projectId;
    this.network = network;
    this.customBackend = customBackend;
    this.baseUrl = this.getNetworkApiUrl();
  }

  private getNetworkApiUrl = () => {
    if (this.customBackend) {
      return this.customBackend;
    }
    return `https://cardano-${this.network}.blockfrost.io/api/v0`;
  };

  private fetch = async (path: string, init?: Partial<RequestInit>) => {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      headers: {
        project_id: this.projectId,
      },
      ...init,
    });

    return response.json();
  };

  getAddressBalance = async (address: string): Promise<number> => {
    const addressData = await this.fetch(`/addresses/${address}`);

    const result: Responses['address_content'] = addressData;
    const lovelaceAmountItem = result.amount.find(amountItem => amountItem.unit === 'lovelace');

    if (lovelaceAmountItem) {
      // TODO(@vladimirvolek)) bignumber
      return Number(lovelaceAmountItem.quantity);
    }
    // TODO(@vladimirvolek) handle error
    return 0;
  };

  getAddressUtxos = async (address: string): Promise<Responses['address_utxo_content']> => {
    const response = await this.fetch(`/addresses/${address}/utxos`);

    return response;
  };

  submitTx = async (tx: Uint8Array): Promise<Responses['address_utxo_content']> => {
    const response = await this.fetch(`/tx/submit`, {
      method: 'POST',
      body: tx,
      headers: { project_id: this.projectId, 'Content-type': 'application/cbor' },
    });

    return response;
  };
}

export const blockfrostClient = new BlockfrostClient(BLOCKFROST_PROJECT_ID, BLOCKFROST_NETWORK);
