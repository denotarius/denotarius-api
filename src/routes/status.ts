import { VERSION } from '../constants.ts';

export default () => {
  return Response.json({
    is_healthy: true,
    version: VERSION,
  });
};
