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
