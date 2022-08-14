import { TypeHandler } from './TypeHandler.js';

/**
 * Type lookup key (type name with additional parameters).
 */
export type TypeKey = string;

/**
 * Type handler resolver.
 */
export interface TypeResolver {

  /**
   * Function responsible for resolving serialized type tag to a type handler.
   * @param key Type lookup key (exact format is implementation specific).
   * @return Resolved type handler.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (key: TypeKey): TypeHandler<any>;

}
