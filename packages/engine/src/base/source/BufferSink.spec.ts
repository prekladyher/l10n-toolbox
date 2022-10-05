import BufferSink from './BufferSink.js';

describe('BufferSink', () => {

  it('handles multiple write', () => {
    const sink = new BufferSink();
    expect(sink.size()).toBe(0);
    // Write multiple buffers
    sink.write(Buffer.from('0102', 'hex'));
    sink.write(Buffer.from('0304', 'hex'));
    expect(sink.size()).toBe(4);
    // Close and check result
    sink.close();
    expect(sink.buffers[0].toString('hex')).toBe('01020304');
  });

});
