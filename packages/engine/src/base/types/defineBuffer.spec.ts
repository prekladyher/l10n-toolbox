import { BufferSource } from '../source/index.js';
import { defineBuffer } from './defineBuffer.js';

describe('buffer', () => {

  it('handle raw', () => {
    const type = defineBuffer(4);
    const buffer = Buffer.from([0x1, 0x2, 0x3, 0x4]);
    expect(type.read(new BufferSource(buffer)).toString('hex')).toEqual('01020304');
  });

  it('handle hex', () => {
    const type = defineBuffer(4, 'hex');
    const buffer = Buffer.from([0x1, 0x2, 0x3, 0x4]);
    expect(type.read(new BufferSource(buffer))).toEqual('01020304');
  });

});
