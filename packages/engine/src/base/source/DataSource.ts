/**
 * Sequential data source.
 */
export default interface DataSource {

  /**
   * Read the defined number of bytes as a buffer.
   * Returned buffer may be reused upon next data source interaction.
   */
  read(length: number): Buffer;

  /**
   * Skip the defined number of bytes.
   */
  skip(length: number): void;

  /**
   * Go to the defined offset from start.
   */
  seek(offset: number): void;

  /**
   * Close the underlying data source.
   */
  close(): void;

  /**
   * Get reader's actual cursor position.
   */
  cursor(): number;

}
