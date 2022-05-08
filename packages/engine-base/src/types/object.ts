import { ObjectSchema } from '../schema';
import { defineStruct } from './struct';
import TypeHandler from './TypeHandler';
import TypeResolver from './TypeResolver';

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
