import { TypeKey } from '../types/TypeResolver';

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
  type: TypeKey;

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