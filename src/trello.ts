import { properties, queryString, listToObject } from './common';
declare var global: any;

const creds = {
  token: properties.getProperty('trello-token'),
  key: properties.getProperty('trello-key')
};

export const request = (
  endpoint: string,
  options?: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions,
  params?: any
) => {
  const res = UrlFetchApp.fetch(
    'https://api.trello.com/1/' + endpoint + queryString(Object.assign({ ...creds }, params)),
    options
  );
  const text = res.getContentText();
  return JSON.parse(text);
};
