import { execOnGAS } from './test-util';
declare const getTodaysUTAS: Function;

describe('execOnGAS', () => {
  beforeAll(async () => {
    jest.setTimeout(1000 * 20);
  });
  it('executes code on GAS', async () => {
    const res = await execOnGAS(function() {
      return 1 + 1;
    });
    expect(res).toBe(2);
  });
});
