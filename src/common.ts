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
export const sandboxId = properties.getProperty('sandboxId');
