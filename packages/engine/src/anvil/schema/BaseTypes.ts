import { defineNative, TypeRegistry } from '../../base/index.js';

export default function registerTypes(): TypeRegistry {
  return {
    int: () => defineNative('Int32LE'),
    uint8: () => defineNative('UInt8'),
    uint32: () => defineNative('UInt32LE'),
    uint64: () => defineNative('UInt64LE'),
    int16: () => defineNative('Int16LE'),
    int32: () => defineNative('Int32LE'),
    int64: () => defineNative('Int64LE'),
    float: () => defineNative('FloatLE'),
  };
}
