import { BlockFrostAPI, BlockFrostIPFS } from '@blockfrost/blockfrost-js';

import constants from '../constants.js';

export class BlockfrostClient {
  api: BlockFrostAPI;
  ipfs: BlockFrostIPFS;

  constructor() {
    this.api = new BlockFrostAPI({ projectId: constants.blockfrost.apiKey });
    this.ipfs = new BlockFrostIPFS({ projectId: constants.blockfrost.ipfsKey });
  }

  getAddressBalance = async (address: string) => {
    const addressData = await this.api.addresses(address);
    const lovelaceAmountItem = addressData.amount.find(
      amountItem => amountItem.unit === 'lovelace',
    );

    if (lovelaceAmountItem) {
      return Number(lovelaceAmountItem.quantity);
    }

    return;
  };

  getAddressUtxos = async (address: string) => {
    const response = await this.api.addressesUtxos(address);

    return response;
  };

  submitTx = async (tx: Uint8Array) => {
    const response = await this.api.txSubmit(tx);

    return response;
  };

  pin = async (path: string) => {
    const pinnedItems = await this.ipfs.pin(path);

    return pinnedItems;
  };
}

export const blockfrostClient = new BlockfrostClient();
