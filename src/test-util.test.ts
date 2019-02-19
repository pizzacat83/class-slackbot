import { evalOnGAS } from './test-util';
declare const getTodaysUTAS: Function;
declare var undefined_variable: any;

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
    expect(res).toBe(undefined);
  });

  it('throws an error occurred on GAS', async () => {
    await expect(
      evalOnGAS(function() {
        undefined_variable.something();
      })
    ).rejects.toBeTruthy();
  });
});
