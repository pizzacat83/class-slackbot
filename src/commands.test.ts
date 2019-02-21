import { get } from 'request';
import { promisify } from 'util';
import { evalOnGAS } from './test-util';
declare const slackCommands: any;

describe('slackCommands.formula', () => {
  let res = undefined;

  beforeAll(async () => {
    jest.setTimeout(1000 * 20);
    res = await evalOnGAS(function() {
      var e = {
        text: 'a + b > c & d'
      };
      return slackCommands.formula(e);
    });
  });

  it('returns response to channel with image attachment', () => {
    expect(res.response_type).toBe('in_channel');
    expect(res.attachments).toHaveLength(1);
    const attachment = res.attachments[0];
    expect(attachment).toHaveProperty('text');
    expect(attachment.image_url).toBeTruthy();
    expect(typeof attachment.image_url).toBe('string');
  });

  it('returns available image_url', async () => {
    const image_url = res.attachments[0].image_url;
    const { statusCode, headers, body } = await promisify(get)(image_url, undefined) as {statusCode: number, headers: {}, body: string};
    expect(statusCode).toBe(200);
    expect(headers['content-type']).toContain('image');
    expect(body).toBeTruthy();
    console.log(image_url);
  });
});

describe('slackCommands.question', () => {
  beforeAll(() => {
    jest.setTimeout(1000 * 20);
  });

  it('returns mentions to channel on valid input', async () => {
    const res = await evalOnGAS(function() {
      var e = {
        text: '<#' + PropertiesService.getScriptProperties().getProperty('seashore-id') + '> hoge'
      };
      return slackCommands.question(e);
    });
    expect(res.response_type).toBe('in_channel');
    expect(res.text).toMatch(/^(<@U(.+)> ?)+$/);
  });

  it('returns ephemeral error message on invalid input', async () => {
    const res = await evalOnGAS(function() {
      var e = {
        text: 'hoge'
      };
      return slackCommands.question(e);
    });
    expect(res.response_type).toBe('ephemeral');
    expect(res.text).toContain('Error');
  });
});
