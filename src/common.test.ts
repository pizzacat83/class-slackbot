import { evalOnGAS } from './test-util';

declare const listMessages: (
  channel: string,
  option?: { latest?: string | number; oldest?: string | number }
) => any[];

let res;

describe('listMessages', () => {
  beforeAll(async () => {
    jest.setTimeout(1000 * 20);
    res = await evalOnGAS(function() {
      return listMessages(
        PropertiesService.getScriptProperties().getProperty('sample-channel-id'),
        {
          oldest: new Date('2018/12/1').getTime() / 1000,
          latest: new Date('2018/12/31').getTime() / 1000
        }
      );
    });
  });

  it('returns messages between given timestamps', () => {
    expect(res).toBeInstanceOf(Array);
    for (const message of res) {
      expect(typeof message.ts).toBe('string');
      expect(parseFloat(message.ts)).toBeGreaterThanOrEqual(new Date('2018/12/1').getTime() / 1000);
      expect(parseFloat(message.ts)).toBeLessThanOrEqual(new Date('2018/12/31').getTime() / 1000);
      expect(typeof message.type).toBe('string');
      expect(typeof message.text).toBe('string');
    }
  });
});
