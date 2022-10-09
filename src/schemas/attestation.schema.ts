export const attestationSubmitSchema = {
  body: {
    type: 'object',
    properties: {
      ipfs: {
        type: 'array',
        items: {
          cid: {
            type: 'string',
          },
          metadata: {
            type: 'any',
            nullable: true,
          },
        },
      },
      pin_ipfs: {
        type: 'boolean',
        nullable: true,
        default: false,
      },
    },
  },
};
