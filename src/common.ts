declare var global: any;
declare var SlackApp: any;

export const properties = PropertiesService.getScriptProperties();
export const slack = {
  user: SlackApp.createByClientId(null, null, null, null, {
    name: 'user',
    token: properties.getProperty('slack-user-token')
  }),
  bot: SlackApp.createByClientId(null, null, null, null, {
    name: 'bot',
    token: properties.getProperty('slack-bot-token')
  })
};
export const seashoreId = properties.getProperty('seashore-id');

export const listMessages = (channel: string, option: { latest?: string | number; oldest?: string | number } = {}): any[] => {
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