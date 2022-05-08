import { DataSource } from '../source';

/**
 * Type deserializer function.
 */
export interface ReadFn<T> {

  /**
   * Read type value from the given data source.
   * @param source Binary data source.
   * @return Deserialized type value.
   */
  (source: DataSource): T;

}

/**
 * Type serializer function.
 */
export interface WriteFn<T> {

  /**
   * Write type value as one or more binary buffers.
   * @param value Value to serialize, i.e. convert to byte buffer(s).
   * @return Serialized type value in one or more byte buffers.
   */
  (value: T): Buffer[];

}

/**
 * Type handler capable of serializing and deserializing values of specific type.
 */
export default interface TypeHandler<T> {

  /**
   * Type deserializer method.
   */
  read: ReadFn<T>;

  /**
   * Type serializer method.
   */
  write: WriteFn<T>;

}