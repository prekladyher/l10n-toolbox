import { vi } from 'vitest';
import { BufferSource } from '../source/index.js';
import { createResolver } from './createResolver.js';
import { defineNative } from './defineNative.js';
import { defineStruct } from './defineStruct.js';

describe('struct', () => {

  const resolve = createResolver({
    uint8: () => defineNative('UInt8'),
    uint32: () => defineNative('UInt32LE')
  });

  const TEST_DATA = Buffer.from([1, 0, 0, 0, 2, 3, 4, 5]);

  it('handle named struct', () => {
    const type = defineStruct([
      { name: 'foo', type: 'uint32' },
      { name: 'bar', type: 'uint8' }
    ], resolve);
    expect(type.read(new BufferSource(TEST_DATA))).toEqual({ foo: 1, bar: 2 });
  });

  it('handle unnamed struct', () => {
    const type = defineStruct([
      { type: 'uint32' },
      { type: 'uint32' }
    ], resolve);
    expect(type.read(new BufferSource(TEST_DATA))).toEqual({});
  });

  it('handle assert call', () => {
    const assert = vi.fn().mockReturnValue(true);
    const type = defineStruct([
      { name: 'foo', type: 'uint32', assert }
    ], resolve);
    expect(type.read(new BufferSource(TEST_DATA))).toEqual({ foo: 1 });
    expect(assert).toHaveBeenCalledWith(1, expect.anything());
  });

  it('handle direct type', () => {
    const type = defineStruct([
      { name: 'foo', type: defineNative('UInt32LE') },
      { name: 'bar', type: defineNative('UInt8') },
    ], resolve);
    expect(type.read(new BufferSource(TEST_DATA))).toEqual({ foo: 1, bar: 2 });
  });

});
