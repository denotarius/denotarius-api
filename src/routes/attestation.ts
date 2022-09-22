import { getBatch } from '../database.ts';

export default (attestationId: string) => {
  const attestation = getBatch(attestationId);

  if (attestation) {
    return Response.json({
      order_id: attestation.uuid,
      payment: {
        address: attestation.address,
        amount: attestation.amount,
      },
      status: attestation.status,
      orderTimeLeftInSeconds: attestation.order_time_limit_in_seconds,
    });
  }

  return new Response(`Attestation with id: ${attestationId} was not found`, {
    status: 404,
  });
};
