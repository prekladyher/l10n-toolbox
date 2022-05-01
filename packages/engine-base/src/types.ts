/**
 * Type decoder function.
 */
export interface DecodeFn<T> {

  /**
   * Decode data in the given binary buffer at the specified offset as a specific type value.
   * @param buffer Buffer to read the value from.
   * @param offset Byte offset where the data starts.
   * @return Number of consumed bytes together with the decoded value.
   */
  (buffer: Buffer, offset: number): [number, T];

}

/**
 * Type encoder function.
 */
export interface EncodeFn<T> {

  /**
   * Encode value of a specific type as one or more binary buffers.
   * @param value Value to encode, i.e. convert to byte buffer(s).
   * @return Encoded value in one or more byte buffers.
   */
   (value: T): Buffer[];

}

/**
 * Type handler capable of encoding and decoding values of a defined type.
 */
export interface TypeHandler<T> {

  /**
   * Type decoder method.
   */
  decode: DecodeFn<T>;

  /**
   * Type encoder method.
   */
  encode: EncodeFn<T>;

}

/**
 * Type handler resolver.
 */
export interface TypeResolver {

  /**
   * Function responsible for resolving serialized type tag to a type handler.
   * @param key Serialized type tag (e.g. `string[]` for string array).
   * @return Resolved type handler.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (key: string): TypeHandler<any>;

}
