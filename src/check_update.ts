import { properties, slack, uploadTextFileToSlack, cache, listToObject } from './common';

declare const DriveActivity: any;
declare const People: any;
declare var global: any;

import * as DriveActivityAPI from './google_drive_activity_api';

import * as PeopleAPI from './google_people_api';

import * as Trello from './trello';

import { ItemWrapper } from './google_drive_cache_enabled';

const drivelog_id = properties.getProperty('drivelog-id');
const drivelog_admin_id = properties.getProperty('drivelog-admin-id');
const rootFolderId = properties.getProperty('root-folder-id');

const fetchAllDriveActivities = (
  root_folder_id: string,
  since?: Date | string
): DriveActivityAPI.DriveActivity[] => {
  let activities: DriveActivityAPI.DriveActivity[] = [];
  let response: DriveActivityAPI.DriveActivityAPIResponse;
  if (since instanceof Date) {
    since = since.getTime().toString();
  }
  do {
    response = DriveActivity.Activity.query({
      ancestorName: 'items/' + root_folder_id,
      filter: since ? `time > ${since}` : '',
      pageToken: response ? response.nextPageToken || null : null,
      consolidationStrategy: { legacy: {} }
    });
    activities = activities.concat(response.activities);
  } while (response.nextPageToken);
  return activities;
};

const getActionName = (actionDetail: DriveActivityAPI.ActionDetail): string =>
  Object.keys(actionDetail)[0];

// TODO: use batchGet https://developers.google.com/people/api/rest/v1/people/getBatchGet
const getPersonName = (resourceName: string): string => {
  let name: string = cache.get(`getPersonName.${resourceName}`);
  if (name) return name;
  const person: PeopleAPI.Person = People.People.get(resourceName, { personFields: 'names' });
  if (person.names) {
    name = person.names[0].displayName;
    cache.put(`getPersonName.${resourceName}`, name, 21600);
    return name;
  }
  return resourceName; // TODO: a better approach?
};

const getDriveItem = (driveItemId: string, isFolder: boolean, driveItem?: GoogleAppsScript.Drive.File|GoogleAppsScript.Drive.Folder): ItemWrapper => {
  if (driveItemsCache.has(driveItemId)) {
    return driveItemsCache.get(driveItemId);
  }
  let driveItemWrapper: ItemWrapper;
  if (driveItem && !driveItemsCache.has(driveItemId)) {
    driveItemWrapper = { content: driveItem, id: driveItemId } as ItemWrapper;
  } else {
    if (isFolder) {
      driveItemWrapper = { content: DriveApp.getFolderById(driveItemId), id: driveItemId };
    } else {
      driveItemWrapper = { content: DriveApp.getFileById(driveItemId), id: driveItemId };
    }
  }
  driveItemsCache.set(driveItemId, driveItemWrapper);
  return driveItemWrapper;
};

const targetIsFolder = (target: DriveActivityAPI.Target): boolean =>
  target.driveItem && Boolean(target.driveItem.folder);

const getDriveItemfromTarget = (target: DriveActivityAPI.Target): ItemWrapper => {
  return getDriveItem(getDriveItemId(target), targetIsFolder(target));
};

const getDriveItemId = (target: DriveActivityAPI.Target): string => {
  let itemName: string;
  if (target.driveItem) itemName = target.driveItem.name;
  if (target.teamDrive) itemName = target.teamDrive.name;
  if (target.fileComment) itemName = target.fileComment.parent.name;
  return itemName.substr('items/'.length);
};

const paths = new Map<string, string>();

const getPath = (driveItem: ItemWrapper): string => {
  const rec = (driveItem: ItemWrapper): { path: string; valid: boolean } => {
    if (paths.has(driveItem.id)) {
      return { path: paths.get(driveItem.id), valid: true };
    }
    if (driveItem.id == rootFolderId) {
      return { path: '', valid: true };
    }

    const parents = driveItem.content.getParents();
    while (parents.hasNext()) {
      const parent = parents.next();
      const id = parent.getId();
      const parentWrapper = getDriveItem(id, true, parent);
      const res = rec(parentWrapper);
      if (res.valid) {
        const path =
          res.path + '/' + (driveItem.name || (driveItem.name = driveItem.content.getName()));
        paths.set(driveItem.id, path);
        return { path, valid: true };
      } else {
        return { path: '', valid: false };
      }
    }
    return { path: '', valid: false };
  };
  return rec(driveItem).path || driveItem.name || (driveItem.name = driveItem.content.getName());
};

const driveItemsCache = new Map<string, ItemWrapper>();
const ignoredList = JSON.parse(properties.getProperty('ignored-drive-items'));

const ignored = new Map<string, boolean>();

const isIgnoredItem = (driveItem: ItemWrapper): boolean => {
  if (ignored.has(driveItem.id)) {
    return ignored.get(driveItem.id);
  }
  if (ignoredList.indexOf(driveItem.id) !== -1) {
    ignored.set(driveItem.id, true);
    return true;
  }
  if (driveItem.id === rootFolderId) {
    ignored.set(driveItem.id, false);
    return false;
  }

  let parents = driveItem.content.getParents();
  if (!parents.hasNext()) {
    ignored.set(driveItem.id, false);
    return false;
  }
  while (parents.hasNext()) {
    // 全ての親がignoredならtrue
    const parent = parents.next();
    const parentWrapper = { content: parent, id: parent.getId() };
    if (!isIgnoredItem(parentWrapper)) {
      ignored.set(driveItem.id, false);
      return false;
    }
  }
  ignored.set(driveItem.id, true);
  return true;
};

const { ignoredActions, colors, japaneseTranslations }: { ignoredActions: string[], colors: {}, japaneseTranslations: {} } = require('./drive_activity_settings.json');

const formatDateJST = (timestamp: string): string =>
  Utilities.formatDate(new Date(timestamp), 'JST', 'yyyy-MM-dd HH:mm:ss');

const checkUpdate = (_, since?: string): void => {
  if (!since) {
    since = properties.getProperty('updateCheck.lastChecked');
    if (!since) {
      throw new Error('No `lastChecked`. To fix, execute updateCheck with argument `since`.');
    }
  }
  const lastChecked = Date.now();
  const deletedItems = JSON.parse(properties.getProperty('checkUpdate.deletedItems')) || {};
  for (const activity of fetchAllDriveActivities(rootFolderId, since).reverse()) {
    if (!activity) continue;
    const actionName = getActionName(activity.primaryActionDetail);
    if (ignoredActions.indexOf(actionName) !== -1) {
      continue;
    }
    const targets: DriveActivityAPI.Target[] = activity.targets.filter(
      target => !isIgnoredItem(getDriveItemfromTarget(target))
    );
    if (targets.length === 0) continue;
    const actorsText = activity.actors
      .map(actor => getPersonName(actor.user.knownUser.personName) + ' さん')
      .join(', ');
    const timeText = activity.timestamp
      ? formatDateJST(activity.timestamp)
      : formatDateJST(activity.timeRange.startTime) +
        ' - ' +
        formatDateJST(activity.timeRange.endTime);
    const text = `${actorsText}が *${activity.targets.length}* 件のアイテムを *${
      japaneseTranslations[actionName]
    }* しました。
発生日時: ${timeText}`;
    let fileURL: string;
    if (targets.length <= 20) {
      // attachments
      const attachments = targets.map(target => {
        const driveItem = getDriveItemfromTarget(target);
        return {
          color: colors[actionName],
          title: japaneseTranslations[actionName] + ': ' + getPath(getDriveItemfromTarget(target)),
          text: '', // TODO: include details
          title_link: driveItem.url || (driveItem.url = driveItem.content.getUrl())
        };
      });
      slack.bot.postMessage(drivelog_id, text, {
        icon_emoji: ':google_drive:',
        username: 'UpdateNotifier',
        attachments: JSON.stringify(attachments)
      });
    } else {
      // snippet
      fileURL = uploadTextFileToSlack(
        [drivelog_id],
        targets
          .map(
            target =>
              japaneseTranslations[actionName] + ': ' + getPath(getDriveItemfromTarget(target))
          )
          .join('\n'),
        text
      ).file.permalink;
    }
    if (actionName === 'delete') {
      // trello
      const dueDate = new Date(
        activity.timestamp ? activity.timestamp : activity.timeRange.endTime
      );
      dueDate.setDate(dueDate.getDate() + 3);
      const card = Trello.request(
        'cards',
        { method: 'post' },
        {
          name: `${japaneseTranslations[actionName]} ${activity.targets.length}件 by ${actorsText}`,
          desc: `発生日時: ${timeText}`,
          due: Utilities.formatDate(dueDate, 'GMT', "yyyy-MM-dd'T'HH:mm:ss'Z'"),
          idList: trelloLists.ToDo.id
        }
      );
      if (targets.length <= 20) {
        const checklist = Trello.request(
          `cards/${card.id}/checklists`,
          { method: 'post' },
          { name: 'アイテム一覧' }
        );
        for (const target of targets) {
          const driveItem = getDriveItemfromTarget(target);
          Trello.request(
            `checklists/${checklist.id}/checkItems`,
            { method: 'post' },
            {
              name: getPath(driveItem) + ' ' + driveItem.url || (driveItem.url = driveItem.content.getUrl())
            }
          );
        }
      } else {
        Trello.request(`cards/${card.id}/attachments`, { method: 'post' }, { url: fileURL });
      }
      deletedItems[card.id] = targets.map(target => {
        return { id: getDriveItemId(target), isFolder: targetIsFolder(target) };
      });
      slack.bot.postMessage(drivelog_admin_id, card.url, { as_user: true });
    }
  }
  properties.setProperty('checkUpdate.deletedItems', JSON.stringify(deletedItems));
  properties.setProperty('updateCheck.lastChecked', lastChecked.toString());
};

let trelloLists = JSON.parse(cache.get('checkUpdate.boards'));
if (!trelloLists) {
  trelloLists = listToObject(
    Trello.request(
      `boards/${properties.getProperty('trello-drive-board-id')}/lists`,
      { method: 'get' },
      { fields: 'name' }
    ),
    'name'
  );
  cache.put('checkUpdate.boards', JSON.stringify(trelloLists), 21600);
}

const restoreItem = ({ id, isFolder }: { id: string; isFolder: boolean }): void => {
  // TODO: implement
  if (isFolder) {
    throw new Error('Not implemented');
  } else {
    const deletedFile = DriveApp.getFileById(id);
    if (deletedFile.isTrashed()) {
      const newFile = deletedFile.makeCopy(deletedFile.getName());
      const parents = deletedFile.getParents();
      while (parents.hasNext()) {
        const parent = parents.next();
        parent.addFile(newFile);
      }
    }
  }
};

const checkTrello = (): void => {
  const deletedItems = JSON.parse(properties.getProperty('checkUpdate.deletedItems')) || {};
  const doneCards = Trello.request(`lists/${trelloLists.Done.id}/cards`, { method: 'get' });
  for (const card of doneCards) {
    Trello.request(`cards/${card.id}`, { method: 'put' }, { closed: true });
  }
  const autofixCards: any[] = Trello.request(`lists/${trelloLists.Autofix.id}/cards`, { method: 'get' });
  const toDoCards: any[] = Trello.request(`lists/${trelloLists.ToDo.id}/cards`, { method: 'get' });
  for (const card of autofixCards.concat(
    toDoCards.filter(card => new Date(card.due) < new Date())
  )) {
    const items: { id: string; isFolder: boolean }[] = deletedItems[card.id];
    items.forEach(restoreItem);
    slack.bot.postMessage(drivelog_admin_id, `${card.name} (${card.desc}) を復元しました。`, {
      icon_emoji: ':google_drive:',
      username: 'UpdateNotifier'
    });
    Trello.request(`cards/${card.id}`, { method: 'put' }, { closed: true });
    delete deletedItems[card.id];
  }
  properties.setProperty('checkUpdate.deletedItems', JSON.stringify(deletedItems));
};

global.checkTrello = checkTrello;

global.checkUpdate = checkUpdate;
