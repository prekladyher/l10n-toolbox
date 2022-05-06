import { TypeHandler } from './types';

/**
 * List of native types directly supported by Buffer.
 */
export type NativeType =
  'BigInt64BE' | 'BigInt64LE' |
  'BigUInt64BE' | 'BigUInt64LE' |
  'DoubleBE' | 'DoubleLE' |
  'FloatBE' | 'FloatLE' |
  'Int8' |
  'UInt8' |
  'Int16BE' | 'Int16LE' |
  'Int16BE' | 'Int16LE' |
  'UInt16BE' | 'UInt16LE' |
  'Int32BE' | 'Int32LE' |
  'UInt32BE' | 'UInt32LE';

/**
 * Create handler for JS types handled by native Buffer methods.
 */
export function nativeType(size: number, type: NativeType): TypeHandler<unknown> {
  const decoder = Buffer.prototype['read' + type];
  const encoder = Buffer.prototype['write' + type];
  return {
    decode: (buffer: Buffer, offset: number) => [
      size,
      decoder.call(buffer, offset)
    ],
    encode: (value: unknown) => {
      const buffer = Buffer.alloc(size);
      encoder.call(buffer, value);
      return [buffer];
    }
  };
}
