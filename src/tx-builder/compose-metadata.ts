import {
  encode_json_str_to_metadatum,
  MetadataJsonSchema,
  TransactionMetadatum,
} from '@emurgo/cardano-serialization-lib-nodejs';

export const composeMetadata = (data: unknown, metadataLabel: number): TransactionMetadatum => {
  const object = {
    [metadataLabel]: data,
  };

  try {
    const metadata = encode_json_str_to_metadatum(
      JSON.stringify(object),
      MetadataJsonSchema.BasicConversions,
    );

    return metadata;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to encode metadata.');
  }
};
