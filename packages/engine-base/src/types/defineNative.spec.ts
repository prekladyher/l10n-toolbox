import { BufferSource } from '../source';
import { defineNative } from './defineNative';

describe('native', () => {

  it('handle UInt32LE', () => {
    const type = defineNative('UInt32LE');
    const buffer = Buffer.from([0x1, 0, 0, 0]);
    expect(type.read(new BufferSource(buffer))).toEqual(1);
    expect(type.write(1)[0].toString()).toEqual(buffer.toString());
  });

  it('handle Int64LE', () => {
    const type = defineNative('Int64LE');
    const buffer = Buffer.from([0x1, 0, 0, 0, 0, 0, 0, 0]);
    expect(type.read(new BufferSource(buffer))).toEqual(1n);
    expect(type.write(1n)[0].toString()).toEqual(buffer.toString());
  });

});
