import { defineStruct, StructSchema } from './defineStruct.js';
import { TypeHandler } from './TypeHandler.js';
import { TypeFactory } from './TypeRegistry.js';
import { TypeResolver } from './TypeResolver.js';

/**
 * Mapped object type schema.
 */
export interface ObjectSchema<T, S, L = StructSchema | TypeHandler<S>> {

  /**
   * Persisted object state layout.
   */
  layout: L;

  /**
   * Restore object state from loaded state.
   */
  restore: (loaded: S) => T;

  /**
   * Convert object to it's persisted state.
   */
  persist: (object: unknown) => S;

}

/**
 * Create handler for custom object type.
 */
export function defineObject<T, S>(schema: ObjectSchema<T, S>, resolve: TypeResolver): TypeHandler<T> {
  const layout = Array.isArray(schema.layout)
    ? defineStruct(schema.layout, resolve)
    : schema.layout;
  return {
    read: source => {
      const value = layout.read(source);
      return schema.restore(value as S);
    },
    write: value => {
      return layout.write(schema.persist(value));
    }
  };
}

/**
 * Create object based type factory with the given schema.
 */
export function registerObject<T, S>(schema: ObjectSchema<T, S>): TypeFactory<T> {
  return (config, resolve) => defineObject(schema, resolve);
}
