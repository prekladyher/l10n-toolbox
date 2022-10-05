/**
 * Sequential data sink.
 */
export default interface DataSink {

  /**
   * Write data buffer to the sink.
   * @param buffer Data buffer.
   */
  write(buffer: Buffer): void;

  /**
   * Close and free underlying resources.
   */
  close(): void;

  /**
   * Get number of written bytes.
   */
  size(): number;

}
