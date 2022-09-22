import { serve } from 'https://deno.land/std@0.114.0/http/server.ts';

import { ROUTES } from './constants.ts';
import { initDb } from './database.ts';
import attestation from './routes/attestation.ts';
import attestationSubmit from './routes/attestation_submit.ts';
import root from './routes/root.ts';
import status from './routes/status.ts';
import checkBatches from './tasks/check_batches.ts';

initDb();

async function handler(req: Request): Promise<Response> {
  const statusRouteMatch = ROUTES.STATUS_ROUTE.exec(req.url);
  const rootRouteMatch = ROUTES.ROOT_ROUTE.exec(req.url);
  const attestationSubmitRouteMatch = ROUTES.ATTESTATION_SUBMIT_ROUTE.exec(req.url);
  const attestationOrderRouteMatch = ROUTES.ATTESTATION_ORDER_ROUTE.exec(req.url);

  // routes

  // /
  if (rootRouteMatch) {
    return root();
  }

  // /status
  if (statusRouteMatch) {
    return status();
  }

  // /attestation/submit
  if (attestationSubmitRouteMatch) {
    // TODO(@vladimirvolek) validate this json and return errors
    const jsonData = await req.json();
    return attestationSubmit(jsonData);
  }

  // /attestation/:order_id
  if (attestationOrderRouteMatch) {
    const orderId = attestationOrderRouteMatch.pathname.groups['order_id'];
    return attestation(orderId);
  }

  return new Response('Not found', {
    status: 404,
  });
}

setInterval(() => {
  checkBatches();
}, 1000);

console.log('Listening on http://localhost:8000');

serve(handler);
