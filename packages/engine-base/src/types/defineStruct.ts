import { string } from 'yargs';
import { DataSource } from '../source';
import { TypeHandler } from './TypeHandler';
import { TypeFactory } from './TypeRegistry';
import { TypeResolver, TypeKey } from './TypeResolver';

/**
 * Struct type schema.
 */
export type StructSchema = StructMemberSchema[];

/**
 * Struct type member.
 */
export interface StructMemberSchema {

  /**
   * Struct member name.
   */
  name?: string;

  /**
   * Struct member type.
   */
  type: TypeKey | TypeHandler<unknown>;

  /**
   * Default member value.
   */
  value?: unknown;

  /**
   * Value assertion callback.
   */
  assert?: StructAssertFn;

}

/**
 * Struct member value validation method.
 */
export interface StructAssertFn {

  /**
   * Check that the provided value is not somethig unexpected.
   * @param value Parsed struct member value.
   * @param schema Schema for the stuct member that is being checked.
   * @returns True if the value is to be considered valid, false otherwise.
   */
  (value: unknown, schema: StructMemberSchema): boolean;

}

// This is the best we can do, unfortunately
type StructType = Record<string, unknown>;

/**
 * Create handler for struct (fixed layout) type.
 */
export function defineStruct<R = StructType>(schema: StructSchema, resolve: TypeResolver): TypeHandler<R> {
  const handlers = schema.map(member => typeof member.type === 'string' ? resolve(member.type) : member.type);
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
      return result as R;
    },
    write: struct => {
      if (!struct || typeof struct !== 'object') {
        throw Error(`Invalid value type: ${typeof struct}`);
      }
      return schema.flatMap((member, idx) => {
        const value = member.name && member.name in struct
          ? (struct as Record<string, unknown>)[member.name]
          : member.value;
        return handlers[idx].write(value);
      });
    }
  };
}

/**
 * Create struct based type factory with the given schema.
 */
export function registerStruct<R = StructType>(schema: StructSchema): TypeFactory<R> {
  return (config, resolve) => defineStruct(schema, resolve);
}
