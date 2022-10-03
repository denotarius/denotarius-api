export const mnemonicToPrivateKey = [
  {
    description: 'all seed',
    mnemonic: 'all all all all all all all all all all all all',
    result:
      '78fe04891cbda885b3ee9b7a60bb5991c3209b07f16324c2d68cb9c7c328ed512a18cdf9b5c0fa98e7d620ae9d851a58aca7e4e0ab46f607c03e78498b345b1b7c0b5c44c1ddb9049bfcaf4ec5d73236392321c69979bbcff1f7c1b6d74c9c5a',
  },
];

export const mnemonicToXpub = [
  {
    description: 'all seed',
    mnemonic: 'all all all all all all all all all all all all',
    result:
      'd507c8f866691bd96e131334c355188b1a1d0b2fa0ab11545075aab332d77d9eb19657ad13ee581b56b0f8d744d66ca356b93d42fe176b3de007d53e9c4c4e7a',
  },
];

export const deriveAddress = [
  {
    description: 'all seed testnet',
    xpub: 'd507c8f866691bd96e131334c355188b1a1d0b2fa0ab11545075aab332d77d9eb19657ad13ee581b56b0f8d744d66ca356b93d42fe176b3de007d53e9c4c4e7a',
    isTestnet: true,
    result:
      'addr_test1qzq0nckg3ekgzuqg7w5p9mvgnd9ym28qh5grlph8xd2z92sj922xhxkn6twlq2wn4q50q352annk3903tj00h45mgfmsu8d9w5',
  },
  {
    description: 'all seed mainnet',
    xpub: 'd507c8f866691bd96e131334c355188b1a1d0b2fa0ab11545075aab332d77d9eb19657ad13ee581b56b0f8d744d66ca356b93d42fe176b3de007d53e9c4c4e7a',
    isTestnet: false,
    result:
      'addr1qxq0nckg3ekgzuqg7w5p9mvgnd9ym28qh5grlph8xd2z92sj922xhxkn6twlq2wn4q50q352annk3903tj00h45mgfmsl3s9zt',
  },
];
