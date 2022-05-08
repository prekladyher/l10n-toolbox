import TypeHandler from './TypeHandler';

/**
 * Type lookup key (type name with additional parameters).
 */
export type TypeKey = string;

/**
 * Type handler resolver.
 */
export default interface TypeResolver {

  /**
   * Function responsible for resolving serialized type tag to a type handler.
   * @param key Type lookup key (exact format is implementation specific).
   * @return Resolved type handler.
   */
  (key: TypeKey): TypeHandler<any>;

}
