// TODO: class
export interface FileWrapper {
  content: GoogleAppsScript.Drive.File;
  datecreated?: Date;
  description?: string;
  downloadurl?: string;
  editors?: GoogleAppsScript.Drive.User[];
  id?: string;
  lastupdated?: Date;
  mimetype?: string;
  name?: string;
  owner?: GoogleAppsScript.Drive.User;
  sharingaccess?: GoogleAppsScript.Drive.Access;
  sharingpermission?: GoogleAppsScript.Drive.Permission;
  size?: GoogleAppsScript.Integer;
  thumbnail?: GoogleAppsScript.Base.Blob;
  url?: string;
  viewers?: GoogleAppsScript.Drive.User;
}

export interface FolderWrapper {
  content: GoogleAppsScript.Drive.Folder;
  datecreated?: Date;
  description?: string;
  downloadurl?: string;
  editors?: GoogleAppsScript.Drive.User[];
  id?: string;
  lastupdated?: Date;
  name?: string;
  owner?: GoogleAppsScript.Drive.User;
  sharingaccess?: GoogleAppsScript.Drive.Access;
  sharingpermission?: GoogleAppsScript.Drive.Permission;
  size?: GoogleAppsScript.Integer;
  url?: string;
  viewers?: GoogleAppsScript.Drive.User;
}

export type ItemWrapper = FileWrapper | FolderWrapper;
