import { properties, slack, uploadTextFileToSlack, cache } from './common';

declare const DriveActivity: any;
declare const People: any;
declare var global: any;

import * as DriveActivityAPI from './google_drive_activity_api';

import * as PeopleAPI from './google_people_api';

import { FileWrapper, FolderWrapper, ItemWrapper } from './google_drive_cache_enabled';

const drivelog_id = properties.getProperty('drivelog-id');
const rootFolderId = properties.getProperty('root_folder_id');

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
  Logger.log(resourceName);
  const person: PeopleAPI.Person = People.People.get(resourceName, { personFields: 'names' });
  if (person.names) {
    name = person.names[0].displayName;
    cache.put(`getPersonName.${resourceName}`, name, 21600);
    return name;
  }
  return resourceName; // TODO: a better approach?
}

const getDriveItem = (driveItemId: string, isFolder: boolean): ItemWrapper => {
  
  if (driveItemsCache.has(driveItemId)) {
    return driveItemsCache.get(driveItemId);
  }
  Logger.log(driveItemId);
  let driveItemWrapper: ItemWrapper;
  if (isFolder) {
    driveItemWrapper = { content: DriveApp.getFolderById(driveItemId), id: driveItemId };
  } else {
    driveItemWrapper = { content: DriveApp.getFileById(driveItemId), id: driveItemId };
  }
  driveItemsCache.set(driveItemId, driveItemWrapper);
  return driveItemWrapper;
};

const getDriveItemfromTarget = (target: DriveActivityAPI.Target): ItemWrapper => {
    return getDriveItem(getDriveItemId(target), target.driveItem && target.driveItem.folder === undefined);
}

const getDriveItemId = (target: DriveActivityAPI.Target): string => {
  let itemName: string;
  if (target.driveItem) itemName = target.driveItem.name;
  if (target.teamDrive) itemName = target.teamDrive.name;
  if (target.fileComment) itemName = target.fileComment.parent.name;
  return itemName.substr('items/'.length);
};

const paths = new Map<string, string>();

const getPath = (driveItem: ItemWrapper): string => {
  // TODO: use full path
  return driveItem.name || (driveItem.name = driveItem.content.getName());
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
  while (parents.hasNext()) {
    const parent = parents.next();
    const parentWrapper = { content: parent, id: parent.getId() };
    if (isIgnoredItem(parentWrapper)) {
      ignored.set(driveItem.id, true);
      return true;
    }
  }
  ignored.set(driveItem.id, false);
  return false;
};
  
const { ignoredActions, colors, japaneseTranslations }: { ignoredActions: string[], colors: {}, japaneseTranslations: {} } = require('./drive_activity_settings.json');

const formatDateJST = (timestamp: string): string =>
  Utilities.formatDate(new Date(timestamp), 'JST', 'yyyy-MM-dd HH:mm:ss');

const updateCheck = (since?: string): void => {
  if (!since) {
    since = properties.getProperty('updateCheck.lastChecked');
    if (!since) {
      throw new Error('No `lastChecked`. To fix, execute updateCheck with argument `since`.');
    }
  }
  properties.setProperty('updateCheck.lastChecked', Date.now().toString());
  for (const activity of fetchAllDriveActivities(rootFolderId, since)) {
    if (!activity) continue;
    const actionName = getActionName(activity.primaryActionDetail);
    if (ignoredActions.indexOf(actionName) !== -1) {
      continue;
    }
    const text = `${activity.actors
      .map(actor => getPersonName(actor.user.knownUser.personName) + ' さん')
      .join(', ')}が *${activity.targets.length}* 件のアイテムを *${
      japaneseTranslations[getActionName(activity.primaryActionDetail)]
    }* しました。
発生日時: ${
      activity.timestamp
        ? formatDateJST(activity.timestamp)
        : formatDateJST(activity.timeRange.startTime) + ' - ' + formatDateJST(activity.timeRange.endTime)
}`;
    const targets: DriveActivityAPI.Target[] = activity.targets.filter(
      target => !isIgnoredItem(getDriveItemfromTarget(target))
    );
    if (targets.length === 0) continue;
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
      uploadTextFileToSlack(
        [drivelog_id],
        targets
          .map(
            target =>
              japaneseTranslations[actionName] + ': ' + getPath(getDriveItemfromTarget(target))
          )
          .join('\n'),
        text
      );
    }
  }
};

global.updateCheck = updateCheck;
