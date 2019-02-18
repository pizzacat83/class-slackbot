declare var SlackApp: any;

export const properties = PropertiesService.getScriptProperties();
const slackAccessToken = properties.getProperty('slackAccessToken');
export const slackApp = SlackApp.create(slackAccessToken);
export const sandboxId = properties.getProperty('sandboxId');
