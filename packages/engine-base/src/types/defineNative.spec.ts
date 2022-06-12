import { BufferSource } from '../source';
import { defineNative } from './defineNative';

describe('native', () => {

  it('handle UInt32', () => {
    const type = defineNative(4,
      buffer => buffer.readUInt32LE(),
      (buffer, value) => buffer.writeUInt32LE(value));
    const buffer = Buffer.from([0x1, 0, 0, 0]);
    expect(type.read(new BufferSource(buffer))).toEqual(1);
    expect(type.write(1)[0].toString()).toEqual(buffer.toString());
  });

  it('handle BigInt64', () => {
    const type = defineNative(8,
      buffer => buffer.readBigInt64LE(),
      (buffer, value) => buffer.writeBigInt64LE(value));
    const buffer = Buffer.from([0x1, 0, 0, 0, 0, 0, 0, 0]);
    expect(type.read(new BufferSource(buffer))).toEqual(1n);
    expect(type.write(1n)[0].toString()).toEqual(buffer.toString());
  });

});
