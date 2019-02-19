import { slack, seashoreId, listMessages } from './common';

declare var global: any;

global.deleteOldMessages = (): void => {
  listMessages(seashoreId, { latest: Date.now() / 1000 - 60 * 60 * 24 })
    .filter(message => !message.pinned_to)
    .forEach(message => {
      slack.user.chatDelete(seashoreId, message.ts);
    });
};
