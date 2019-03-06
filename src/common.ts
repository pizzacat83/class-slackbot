declare var global: any;
declare var SlackApp: any;

export const properties = PropertiesService.getScriptProperties();
export const cache = CacheService.getScriptCache();

const user_token = properties.getProperty('slack-user-token');
const bot_token = properties.getProperty('slack-bot-token');

export const slack = {
  user: SlackApp.createByClientId(null, null, null, null, {
    name: 'user',
    token: user_token
  }),
  bot: SlackApp.createByClientId(null, null, null, null, {
    name: 'bot',
    token: bot_token
  })
};
export const seashoreId = properties.getProperty('seashore-id');

export interface GASWebEvent {
  queryString: string;
  parameter: any;
  parameters: any;
  contentLength: number;
  postdata: { length: number; type: string; contents: string };
}

export interface SlackCommandParams {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  response_url: string;
  trigger_id: string;
}

export const queryString = (params: any): string => {
  return (
    '?' +
    Object.keys(params)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
      .join('&')
  );
};

export const listToObject = (src: any[], key: string = 'id') => {
  const res = {};
  for (const item of src) {
    res[item[key]] = item;
  }
  return res;
};

export const splitList = <T>(list: T[], chunk_length: number): T[][] => {
  return new Array(Math.ceil(list.length / chunk_length))
    .fill(null)
    .map((_, i) => list.slice(chunk_length * i, chunk_length * (i + 1)));
};

export const listMessages = (
  channel: string,
  option: { latest?: string | number; oldest?: string | number } = {}
): any[] => {
  if (typeof option.latest === 'number') option.latest = option.latest.toFixed();
  if (typeof option.oldest === 'number') option.oldest = option.oldest.toFixed();
  const { ok, error, messages }: { ok: boolean; error?: string; messages: any[] } = slack.user.channelsHistory(channel, {
    count: 1000, // TODO: handle has_more
    latest: option.latest,
    oldest: option.oldest
  });
  if (!ok) {
    throw new Error(error);
  }
  return messages;
};

global.listMessages = listMessages;

export const uploadTextFileToSlack = (channels: string[], content: string, comment: string) => {
  return JSON.parse(
    UrlFetchApp.fetch('https://slack.com/api/files.upload', {
      method: 'post',
      payload: {
        content,
        initial_comment: comment,
        channels: channels.join(',')
      },
      headers: { Authorization: 'Bearer ' + bot_token }
    }).getContentText()
  );
};
