export const MAX_CHUNK_SIZE = 262144;

/**
 * Create data chunks for ForgeDataPart encoding.
 */
export function createDataChunks(data: Buffer) {
  const result: Buffer[] = [];
  let offset = 0;
  while (offset < data.length) {
    result.push(data.slice(offset, Math.min(offset + MAX_CHUNK_SIZE, data.length)));
    offset += result[result.length - 1].length;
  }
  return result;
}
