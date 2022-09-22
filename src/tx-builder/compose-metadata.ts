import { C, Core } from 'https://deno.land/x/lucid@0.6.0/mod.ts';

export const composeMetadata = (
  data: unknown,
  metadataLabel: number,
): Core.TransactionMetadatum => {
  const obj = {
    [metadataLabel]: data,
  };

  try {
    const metadata = C.encode_json_str_to_metadatum(
      JSON.stringify(obj),
      C.MetadataJsonSchema.BasicConversions,
    );
    return metadata;
  } catch (err) {
    console.error(err);
    throw Error('Failed to encode metadata.');
  }
};
