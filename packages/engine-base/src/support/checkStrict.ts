import { StructAssertFn, StructMemberSchema } from '../types/defineStruct';

/**
 * Struct property assertion that checks parsed value using strict equality.
 */
export function checkStrict(expected: unknown = undefined): StructAssertFn {
  return (value: unknown, schema: StructMemberSchema) => {
    return expected !== undefined ? expected === value : schema.value === value;
  };
}
