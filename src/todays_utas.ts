import { slack, seashoreId } from './common';
declare var global: any;

global.getTodaysUTAS = (): any[] => {
  const url = 'http://www.c.u-tokyo.ac.jp/zenki/utasukun/';
  const html = UrlFetchApp.fetch(url).getContentText();
  const attachments = [
    {
      text: html.match('<img.+?>(.+?)<')[1],
      image_url: url + 'utaskun.gif?ts=' + Date.now()
    }
  ];
  return attachments;
};

global.postTodaysUTAS = (): void => {
  slack.bot.postMessage(seashoreId, '', {
    icon_url: 'https://pbs.twimg.com/profile_images/644153525027516416/ZDnno6rh.png',
    username: '本日のユータスくん',
    attachments: JSON.stringify(global.getTodaysUTAS())
  });
};
