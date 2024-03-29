import BufferSource from './BufferSource.js';

describe('BufferSource', () => {

  it('handles multiple read', () => {
    const source = new BufferSource(Buffer.from('01020304', 'hex'));
    expect(source.cursor()).toBe(0);
    expect(source.read(1)[0]).toBe(1);
    source.skip(2);
    expect(source.cursor()).toBe(3);
    expect(source.read(1)[0]).toBe(4);
    expect(() => source.read(1)).toThrowError();
    source.close();
  });

});
