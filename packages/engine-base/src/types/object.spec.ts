import { BufferSource } from '../source';
import { defineNative } from './native';
import { defineObject } from './object';

describe('struct', () => {

  function resolve(key: string) {
    switch (key) {
      case 'uint8': return defineNative(1,
          buffer => buffer.readUInt8(),
          (buffer, value) => buffer.writeUInt8(value));
      default:
        fail(`Invalid type request ${key}`);
    }
  }

  const TEST_DATA = Buffer.from([1, 2]);

  it('handle object', () => {
    const type = defineObject({
      layout: [
        { name: "foo", type: "uint8" },
        { name: "bar", type: "uint8" }
      ],
      restore: loaded => loaded,
      persist: object => object as object
    }, resolve);
    expect(type.read(new BufferSource(TEST_DATA)))
      .toEqual({ foo: 1, bar: 2 });
    expect(Buffer.concat(type.write({ foo: 1, bar: 2 })).toString('hex'))
      .toEqual(TEST_DATA.toString('hex'));
  });

});
