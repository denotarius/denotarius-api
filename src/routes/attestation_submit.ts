import { saveBatch } from '../database.ts';
import { AttestationSumbitInput } from '../types.ts';

export default (data: AttestationSumbitInput) => {
  const savedBatch = saveBatch(data);

  return Response.json({ a: 'done' });
};
