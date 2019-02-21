import { SlackCommandParams, slack } from './common';

declare var global: any;

global.slackCommands = {};

export const formula = (params: SlackCommandParams): {} => {
  // if you want to change username or icon,
  // you should use postMessage instead.
  const url =
    'https://chart.googleapis.com/chart?cht=tx&chl=' +
    encodeURIComponent(params.text) +
    '&ts=' + Date.now().toString();
  return {
    response_type: 'in_channel',
    attachments: [
      {
        text: '',
        color: '#99ddff',
        image_url: url
      }
    ]
  };
};

global.slackCommands.formula = formula;

export const question = (params: SlackCommandParams): {} => {
  // bot: @member @member @member
  const match = params.text.match(/<#(.+?)(\|.+)?>/);
  if (match) {
    const asked_channel = match[1];
    // TODO: should cache?
    const { ok, error, channel: { members } } = slack.bot.channelsInfo(asked_channel);
    if (!ok) throw new Error(error);
    return {
      response_type: 'in_channel',
      text: members.map(m => `<@${m}>`).join(' ')
    };
  } else {
    // no channel specified
    // TODO: open dialog to choose channel?
    return {
      response_type: 'ephemeral',
      text: [
        'Error: 質問先チャンネルが指定されていません。',
        '#から始まるチャンネル名をメッセージに添えて再度送信してください。'
      ].join('\n')
    };
  }
};

global.slackCommands.question = question;
