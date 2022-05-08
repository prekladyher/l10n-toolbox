import { BufferSource } from '../source';
import { defineNative } from './native';
import { defineStruct } from './struct';

describe('struct', () => {

  function resolve(key: string) {
    switch (key) {
      case 'uint8': return defineNative(1,
        buffer => buffer.readUInt8(),
        (buffer, value) => buffer.writeUInt8(value));
      case 'uint32': return defineNative(4,
        buffer => buffer.readUInt32LE(),
        (buffer, value) => buffer.writeUInt32LE(value));
      default:
        fail(`Invalid type request ${key}`);
    }
  }

  const TEST_DATA = Buffer.from([1, 0, 0, 0, 2, 0, 0, 0]);

  it('handle named struct', () => {
    const type = defineStruct([
      { name: 'foo', type: 'uint32' },
      { name: 'bar', type: 'uint8' }
    ], resolve);
    expect(type.read(new BufferSource(TEST_DATA)))
      .toEqual({ foo: 1, bar: 2 });
  });

  it('handle unnamed struct', () => {
    const type = defineStruct([
      { type: 'uint32' },
      { type: 'uint32' }
    ], resolve);
    expect(type.read(new BufferSource(TEST_DATA))).toEqual({});
  });

  it('handle assert call', () => {
    const assert = jest.fn().mockReturnValue(true);
    const type = defineStruct([
      { name: 'foo', type: 'uint32', assert }
    ], resolve);
    expect(type.read(new BufferSource(TEST_DATA))).toEqual({ foo: 1 });
    expect(assert).toHaveBeenCalledWith(1, expect.anything());
  });

});
