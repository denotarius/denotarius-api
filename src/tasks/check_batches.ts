import moment from 'https://deno.land/x/momentjs@2.29.1-deno/mod.ts';

import { AMOUNT_TO_PAY_IN_LOVELACES } from '../constants.ts';
import { getActiveBatches, updateBatchStatus } from '../database.ts';

export default () => {
  const activebatches = getActiveBatches();

  for (const badge of activebatches) {
    // expire unpaid batches
    const momentNow = moment(new Date());
    const momentCreated = moment(badge.created_at);

    const differenceInSeconds = momentNow.diff(momentCreated, 'seconds');

    if (differenceInSeconds >= badge.order_time_limit_in_seconds) {
      updateBatchStatus(badge.uuid, 'expired');
    }

    // check payments
    const addressBalanceLovelaces = 10;
    if (addressBalanceLovelaces >= AMOUNT_TO_PAY_IN_LOVELACES) {
      // is paid
    }
  }
};
