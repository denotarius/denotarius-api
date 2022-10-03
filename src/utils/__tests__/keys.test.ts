import * as cardano from '../keys.js';
import { describe, test, expect } from 'vitest';
import * as fixtures from '../__fixtures__/keys.js';
import { deriveAddress } from '@blockfrost/blockfrost-js';

describe('keys generation', () => {
  fixtures.mnemonicToPrivateKey.forEach(fixture => {
    test(`mnemonicToPrivateKey: ${fixture.description}`, () => {
      expect(cardano.mnemonicToPrivateKey(fixture.mnemonic).to_hex()).toBe(fixture.result);
    });
  });

  fixtures.mnemonicToXpub.forEach(fixture => {
    test(`mnemonic -> xpub: ${fixture.description}`, () => {
      const rootPrvKey = cardano.mnemonicToPrivateKey(fixture.mnemonic);
      const accountPrvKey = cardano.getAccountKey(rootPrvKey);
      const xpub = cardano.getXpub(accountPrvKey);
      expect(xpub).toBe(fixture.result);
    });
  });

  fixtures.deriveAddress.forEach(fixture => {
    test(`deriveAddress: ${fixture.description}`, () => {
      const { address } = deriveAddress(fixture.xpub, 0, 0, fixture.isTestnet);

      expect(address).toBe(fixture.result);
    });
  });
});
