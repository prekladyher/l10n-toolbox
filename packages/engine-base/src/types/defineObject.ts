import { defineStruct, StructSchema } from './defineStruct';
import { TypeHandler } from './TypeHandler';
import { TypeResolver } from './TypeResolver';

/**
 * Mapped object type schema.
 */
export interface ObjectSchema<S, T, L = StructSchema | TypeHandler<S>> {

  /**
   * Persisted object state layout.
   */
  layout: L;

  /**
   * Restore object state from loaded state.
   */
  restore: (loaded: L extends StructSchema ? Record<string, unknown> : S) => T;

  /**
   * Convert object to it's persisted state.
   */
  persist: (object: unknown) => S;

}

/**
 * Create handler for custom object type.
 */
export function defineObject<T, S>(schema: ObjectSchema<S, T>, resolve: TypeResolver): TypeHandler<T> {
  const layout = Array.isArray(schema.layout)
    ? defineStruct(schema.layout, resolve)
    : schema.layout as TypeHandler<S>;
  return {
    read: source => {
      const value = layout.read(source);
      return schema.restore(value);
    },
    write: value => {
      return layout.write(schema.persist(value) as Record<string, unknown>);
    }
  };
}
