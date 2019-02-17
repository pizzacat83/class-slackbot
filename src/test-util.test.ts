import { evalOnGAS } from './test-util';
declare const getTodaysUTAS: Function;

describe('execOnGAS', () => {
  beforeAll(async () => {
    jest.setTimeout(1000 * 20);
  });
  it('executes code on GAS', async () => {
    const res = await evalOnGAS(function() {
      return 1 + 1;
    });
    expect(res).toBe(2);
  });

  it('returns nothing on invalid token', async () => {
    const res = await evalOnGAS(function() {
      return 1 + 1;
    }, 'invalid token');
    expect(res).toContain('No response');
  });
});
