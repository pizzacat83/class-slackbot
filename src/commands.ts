import { SlackCommandParams, slack } from './common';

declare var global: any;

global.slackCommands = {};

const getFormulaImageURL = (tex: string): string =>
  'https://chart.googleapis.com/chart?cht=tx&chl=' +
  encodeURIComponent(tex);


/// #if DEBUG
global.getFormulaImageURL = getFormulaImageURL;
/// #endif

const formula = (params: SlackCommandParams): {} => {
  // if you want to change username or icon,
  // you should use postMessage instead.
  const re = /([^]*?)((\$\$?)[^]+?\3)/g;
  const attachments = [];
  let last_index = 0;
  while (1) {
    const match = re.exec(params.text);
    if (!match) break;
    const [_, pretext, tex] = match;
    last_index += _.length;
    attachments.push({
      pretext,
      image_url: getFormulaImageURL(tex)
    });
  }
  if (last_index === 0) {
    // regard full text as TeX
    attachments.push({
      image_url: getFormulaImageURL(params.text)
    });
  } else if (last_index < params.text.length) {
    // add strings left
    attachments.push({
      pretext: params.text.substr(last_index),
      color: '#ffffff'
    });
  }
  return {
    response_type: 'in_channel',
    attachments
  };
};

global.slackCommands.formula = formula;

const question = (params: SlackCommandParams): {} => {
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
