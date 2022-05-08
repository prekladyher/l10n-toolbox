import { StructSchema } from '../schema';
import TypeHandler from './TypeHandler';
import TypeResolver from './TypeResolver';

/**
 * Create handler for struct (fixed layout) type.
 */
export function defineStruct(schema: StructSchema, resolve: TypeResolver): TypeHandler<Record<string, unknown>> {
  const handlers = schema.map(member => resolve(member.type));
  return {
    read: source => {
      const result = {} as Record<string, unknown>;
      for (let idx = 0; idx < schema.length; idx++) {
        const offset = source.cursor();
        const value = handlers[idx].read(source);
        const member = schema[idx];
        if (member.assert && !member.assert(value, member)) {
          throw Error(`Unexpected ${member.name} value: ${value} at offset: ${offset}`);
        }
        if (member.name) {
          result[member.name] = value;
        }
      }
      return result;
    },
    write: struct => {
      return schema.flatMap((member, idx) => {
        const value = member.name && member.name in struct ? struct[member.name] : member.value;
        return handlers[idx].write(value);
      });
    }
  };
}
