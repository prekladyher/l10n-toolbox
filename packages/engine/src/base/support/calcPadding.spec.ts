import { calcPadding } from './calcPadding.js';

describe('calcPadding', () => {

  it('handle zero padding', () => {
    expect(calcPadding(0, 4)).toBe(0);
    expect(calcPadding(16, 4)).toBe(0);
  });

  it('handle non-zero padding', () => {
    expect(calcPadding(17, 4)).toBe(3);
    expect(calcPadding(18, 4)).toBe(2);
    expect(calcPadding(19, 4)).toBe(1);
  });

});
