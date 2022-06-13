import { BufferSource } from '../source';
import { createResolver } from './createResolver';
import { defineNative } from './defineNative';
import { defineObject } from './defineObject';

describe('struct', () => {

  const resolve = createResolver({
    uint8: () => defineNative('UInt8')
  });

  const TEST_DATA = Buffer.from([1, 2]);

  it('handle object', () => {
    const type = defineObject({
      layout: [
        { name: 'foo', type: 'uint8' },
        { name: 'bar', type: 'uint8' }
      ],
      restore: loaded => loaded,
      persist: object => object as object
    }, resolve);
    expect(type.read(new BufferSource(TEST_DATA))).toEqual({ foo: 1, bar: 2 });
    expect(Buffer.concat(type.write({ foo: 1, bar: 2 })).toString('hex'))
      .toEqual(TEST_DATA.toString('hex'));
  });

  it('handle type conversion', () => {
    const type = defineObject({
      layout: defineNative('UInt16LE'),
      restore: loaded => String(loaded),
      persist: object => Number(object)
    }, resolve);
    expect(type.read(new BufferSource(TEST_DATA))).toBe('513');
    expect(Buffer.concat(type.write('513')).toString('hex')).toBe('0102');
  });

});
