import { defineStruct, StructSchema } from './defineStruct';
import { TypeHandler } from './TypeHandler';
import { TypeResolver } from './TypeResolver';

/**
 * Mapped object type schema.
 */
export interface ObjectSchema {

  /**
   * Struct defining object state layout.
   */
  layout: StructSchema;

  /**
   * Restore object state from loaded data.
   */
  restore: (loaded: object) => unknown;

  /**
   * Persist object state.
   */
  persist: (object: unknown) => object;

}

/**
 * Create handler for custom object type.
 */
export function defineObject(schema: ObjectSchema, resolve: TypeResolver): TypeHandler<unknown> {
  const layout = defineStruct(schema.layout, resolve);
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
