import { BLOCKFROST_NETWORK, BLOCKFROST_PROJECT_ID } from '../constants.ts';
import { AddressBlockfrostResponse, UTXO } from '../types.ts';

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
    const res = await fetch(
      url,
      {
        headers: {
          project_id: this.projectId,
        },
        ...init,
      },
    );

    return res.json();
  };

  getAddressBalance = async (address: string): Promise<number> => {
    const addressData = await this.fetch(
      `/addresses/${address}`,
    );

    const result: AddressBlockfrostResponse = addressData;
    const lovelaceAmountItem = result.amount.find((amountItem) => amountItem.unit === 'lovelace');

    if (lovelaceAmountItem) {
      // TODO(@vladimirvolek)) bignumber
      return Number(lovelaceAmountItem.quantity);
    }
    // TODO(@vladimirvolek) handle error
    return 0;
  };

  getAddressUtxos = async (address: string): Promise<UTXO[]> => {
    const res = await this.fetch(
      `/addresses/${address}/utxos`,
    );

    return res;
  };

  submitTx = async (tx: Uint8Array): Promise<UTXO[]> => {
    const res = await this.fetch(
      `/tx/submit`,
      {
        method: 'POST',
        body: tx,
        headers: { project_id: this.projectId, 'Content-type': 'application/cbor' },
      },
    );

    return res;
  };
}

export const blockfrostClient = new BlockfrostClient(BLOCKFROST_PROJECT_ID, BLOCKFROST_NETWORK);
