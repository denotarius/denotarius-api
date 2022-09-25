import config from 'config';
import * as dotenv from 'dotenv';

import app from './app.ts';
import { initDatabase } from './database.ts';

dotenv.config();

initDatabase();

const port = Number(config.get('server.port'));
const debug: string = config.get('server.debug');

const server = app({
  logger: {
    transport:
      process.env.NODE_ENV === 'development' || debug
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
            },
          }
        : undefined,
  },
  ignoreTrailingSlash: true,
});

server.listen({ port }, error => {
  if (error) {
    console.log(error);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
});

// import { serve } from 'https://deno.land/std@0.114.0/http/server.ts';

// import { ROUTES } from './constants.ts';
// import { initDatabase } from './database.ts';
// import attestationSubmit from './routes/attestation-submit.ts';
// import attestation from './routes/attestation.ts';
// import root from './routes/root.ts';
// import status from './routes/status.ts';
// import checkBatches from './tasks/check-batches.ts';

// initDatabase();

// async function handler(request: Request): Promise<Response> {
//   const statusRouteMatch = ROUTES.STATUS_ROUTE.exec(request.url);
//   const rootRouteMatch = ROUTES.ROOT_ROUTE.exec(request.url);
//   const attestationSubmitRouteMatch = ROUTES.ATTESTATION_SUBMIT_ROUTE.exec(request.url);
//   const attestationOrderRouteMatch = ROUTES.ATTESTATION_ORDER_ROUTE.exec(request.url);

//   // routes

//   // /
//   if (rootRouteMatch) {
//     return root();
//   }

//   // /status
//   if (statusRouteMatch) {
//     return status();
//   }

//   // /attestation/submit
//   if (attestationSubmitRouteMatch) {
//     // TODO(@vladimirvolek) validate this json and return errors
//     const jsonData = await request.json();

//     return attestationSubmit(jsonData);
//   }

//   // /attestation/:order_id
//   if (attestationOrderRouteMatch) {
//     const orderId = attestationOrderRouteMatch.pathname.groups['order_id'];

//     return attestation(orderId);
//   }

//   return new Response('Not found', {
//     status: 404,
//   });
// }

// setInterval(() => {
//   checkBatches();
// }, 1000);

// console.log('Listening on http://localhost:8000');

// serve(handler);
