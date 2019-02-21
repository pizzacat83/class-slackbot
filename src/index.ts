import { GASWebEvent } from './common';
declare var global: any;

/// #if DEBUG
global.evalOnGAS = (code: string, token: string): string => {
  if (
    Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_512, token)) ===
    PropertiesService.getScriptProperties().getProperty('evalOnGAS-token')
  ) {
    try {
      const res: any = eval(code);
      return JSON.stringify({ res });
    } catch (err) {
      return JSON.stringify({ err });
    }
  } else {
    return '';
  }
};
/// #endif

global.doPost = (e: GASWebEvent): GoogleAppsScript.Content.TextOutput => {
  const command: string = e.parameter.command;
  if (command) {
    // TODO: verification
    // https://api.slack.com/docs/verifying-requests-from-slack
    /* register commands like
        global.slackCommands.command = (params: SlackCommansParams): {} => {}; */
    const res = global.slackCommands[command.substr(1)](e.parameter); // '/command' -> 'command'
    const response = ContentService.createTextOutput();
    response.setMimeType(ContentService.MimeType.JSON);
    response.setContent(JSON.stringify(res));
    return response;
  }
};

import './todays_utas';

import './delete_old_messages';

import './commands';
