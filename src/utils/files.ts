import crypto from 'crypto';

export const generateChecksum = (input: Buffer): string => {
  return crypto.createHash('sha256').update(input).digest('hex');
};
