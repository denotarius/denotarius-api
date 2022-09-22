import { Blockfrost, Lucid } from 'https://deno.land/x/lucid@0.6.0/mod.ts';

import { BLOCKFROST_MAINNET_TOKEN, BLOCKFROST_MAINNET_URL } from '../constants.ts';

export default async () => {
  const lucid = await Lucid.new(
    new Blockfrost(BLOCKFROST_MAINNET_URL, BLOCKFROST_MAINNET_TOKEN),
    'Mainnet',
  );

  return lucid;
};
