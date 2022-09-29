import { BlockFrostAPI, BlockFrostIPFS, Responses } from '@blockfrost/blockfrost-js';

import constants from '../constants.js';

export class BlockfrostClient {
  api: BlockFrostAPI;
  ipfs: BlockFrostIPFS;

  constructor() {
    this.api = new BlockFrostAPI({ projectId: constants.blockforst.apiKey });
    this.ipfs = new BlockFrostIPFS({ projectId: constants.blockforst.ipfsKey });
  }

  getAddressBalance = async (address: string): Promise<number | undefined> => {
    const addressData = await this.api.addresses(address);
    const lovelaceAmountItem = addressData.amount.find(
      amountItem => amountItem.unit === 'lovelace',
    );

    if (lovelaceAmountItem) {
      return Number(lovelaceAmountItem.quantity);
    }

    return;
  };

  getAddressUtxos = async (address: string): Promise<Responses['address_utxo_content']> => {
    const response = await this.api.addressesUtxos(address);

    return response;
  };

  submitTx = async (tx: Uint8Array): Promise<string> => {
    const response = await this.api.txSubmit(tx);

    return response;
  };

  pin = async () => {
    return 'placeholder';
  };
}

export const blockfrostClient = new BlockfrostClient();
