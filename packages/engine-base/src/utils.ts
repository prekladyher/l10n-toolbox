import { StructAssertFn, StructMemberSchema } from "./schema";

/**
 * Get number of additional padding bytes to align data to the specified block size.
 * @param dataLength Current data length in bytes.
 * @param blockLength Single block size in bytes.
 * @returns Number of bytes to add to align data to block size.
 */
export function calcPadding(dataLength: number, blockLength = 4) {
  return (blockLength - (dataLength % blockLength)) % blockLength;
}

/**
 * Struct property assertion that checks parsed value using strict equality.
 */
export function checkStrict(expected: unknown = undefined): StructAssertFn {
  return (value: unknown, schema: StructMemberSchema) => {
    return expected !== undefined ? expected === value : schema.value === value;
  };
}
