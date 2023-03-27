import { BufferSource } from '../source/index.js';
import { defineAscii } from './defineAscii.js';

describe('ascii', () => {

  it('handle basic zstring', () => {
    const input = Buffer.from('foobar\x00', 'ascii');
    expect(defineAscii().read(new BufferSource(input))).toEqual('foobar');
    expect(Buffer.concat(defineAscii().write('foobar'))).toEqual(input);
  });

});
