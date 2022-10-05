/**
 * Get number of additional padding bytes to align data to the specified block size.
 * @param dataLength Current data length in bytes.
 * @param blockLength Single block size in bytes.
 * @returns Number of bytes to add to align data to block size.
 */
export function calcPadding(dataLength: number, blockLength = 4) {
  return (blockLength - (dataLength % blockLength)) % blockLength;
}
