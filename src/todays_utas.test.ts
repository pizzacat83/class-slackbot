import { get } from 'request';
import { promisify } from 'util';
import { evalOnGAS } from './test-util';
declare const getTodaysUTAS: Function;

let res = undefined;

describe('getTodaysUTAS', () => {
  beforeAll(async () => {
    jest.setTimeout(1000 * 20);
    res = await evalOnGAS(function() {
      return getTodaysUTAS();
    });
  });

  it('returns appropriate attachment', () => {
    expect(res).toBeInstanceOf(Array);
    expect(res).toHaveLength(1);
    const attachment = res[0];
    expect(attachment.text).toBeTruthy();
    expect(typeof attachment.text).toBe('string');
    expect(attachment.image_url).toBeTruthy();
  });

  it('returns available image_url', async () => {
    const { statusCode, headers, body } = await promisify(get)(res[0].image_url, undefined) as {statusCode: number, headers: {}, body: string};
    expect(statusCode).toBe(200);
    expect(headers['content-type']).toContain('image');
    expect(body).toBeTruthy();
  });
});
