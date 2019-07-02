import { SlackCommandParams, slack } from './common';

declare var global: any;

global.slackCommands = {};

const getFormulaImageURL = (tex: string): string =>
  'https://chart.googleapis.com/chart?cht=tx&chl=' + encodeURIComponent(tex);

const formula_regexp = /(^|[^\\])((\$\$?)[^]*?[^\\]\3)/g;

/// #if DEBUG
global.getFormulaImageURL = getFormulaImageURL;
global.formula_regexp = formula_regexp;
/// #endif

const formula = (params: SlackCommandParams): {} => {
  // if you want to change username or icon,
  // you should use postMessage instead.
  const re = new RegExp(formula_regexp.source, 'g');
  const blocks = [];
  let last_index = 0;
  while (1) {
    const match = re.exec(params.text);
    if (!match) break;
    const [whole, , tex] = match;
    const text = params.text.substring(last_index, match.index + whole.length - tex.length);
    if (text) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text
        }
      });
    }
    blocks.push({
      type: 'image',
      image_url: getFormulaImageURL(tex),
      alt_text: tex
    });
    last_index = match.index + whole.length;
    re.lastIndex--;
  }
  if (last_index === 0) {
    // regard full text as TeX
    blocks.push({
      type: 'image',
      image_url: getFormulaImageURL(params.text),
      alt_text: params.text
    });
  } else if (last_index < params.text.length) {
    // add strings left
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: params.text.substr(last_index)
      }
    });
  }
  return {
    response_type: 'in_channel',
    blocks
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
