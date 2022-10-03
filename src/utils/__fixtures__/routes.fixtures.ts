export const parseBatch = [
  {
    batch: {
      id: 1,
      uuid: '6b10c7ca-bd9e-4301-973c-69ba4a20b703',
      created_at: '2022-10-03T13:08:25.223Z',
      status: 'unpaid',
      amount: '100000000',
      address:
        'addr_test1qzq0nckg3ekgzuqg7w5p9mvgnd9ym28qh5grlph8xd2z92sj922xhxkn6twlq2wn4q50q352annk3903tj00h45mgfmsu8d9w5',
      address_index: 0,
      order_time_limit_in_seconds: 1800,
      pin_ipfs: true,
    } as const,
    result: {
      orderTimeLeftInSeconds: 1800,
      order_id: '6b10c7ca-bd9e-4301-973c-69ba4a20b703',
      payment: {
        address:
          'addr_test1qzq0nckg3ekgzuqg7w5p9mvgnd9ym28qh5grlph8xd2z92sj922xhxkn6twlq2wn4q50q352annk3903tj00h45mgfmsu8d9w5',
        amount: '100000000',
      },
      status: 'unpaid',
    },
  },
];
