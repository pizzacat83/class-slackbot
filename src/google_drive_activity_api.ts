export type DriveActivityAPIResponse = {
  activities: DriveActivity[];
  nextPageToken?: string;
};

export type DriveActivity = {
  primaryActionDetail: ActionDetail;
  actors: Actor[];
  actions: Action[];
  targets: Target[];
} & Time;

// https://developers.google.com/drive/activity/v2/reference/rest/v2/activity/actiondetail
export type ActionDetail = any; // TODO: implement

export type Actor = {
  // TODO: implement other actor types
  // https://developers.google.com/drive/activity/v2/reference/rest/v2/activity/actor
  user: User;
};

export type User = {
  // TODO: implement other user types
  knownUser: { personName: string; isCurrentUser: boolean };
};

export type Action = {
  detail: ActionDetail;
  actor: Actor;
  target: Target;
} & Time;

export type Target =
  | {
      driveItem: DriveItem;
      teamDrive: undefined;
      fileComment: undefined;
    }
  | {
      driveItem: undefined;
      teamDrive: TeamDrive;
      fileComment: undefined;
    }
  | {
      driveItem: undefined;
      teamDrive: undefined;
      fileComment: FileComment;
    };

export type DriveItem = {
  name: string;
  title: string;
  mimeType: string;
  owner: Owner;
} & (
  | {
      file: File;
      folder: undefined;
    }
  | {
      file: undefined;
      folder: Folder;
    });

export type TeamDrive = {
  name: string;
  title: string;
  root: DriveItem;
};

export type Owner = {
  // TODO: implement other owner types
  // https://developers.google.com/drive/activity/v2/reference/rest/v2/activity/driveitem
  user: User;
};

export type Folder = {
  type: 'TYPE_UNSPECIFIED' | 'MY_DRIVE_ROOT' | 'TEAM_DRIVE_ROOT' | 'STANDARD_FOLDER';
};

export type File = {
  file: {};
};

export type FileComment = {
  legacyCommentId: string;
  legacyDiscussionId: string;
  linkToDiscussion: string;
  parent: DriveItem;
};

export type TimeRange = {
  startTime: string;
  endTime: string;
};

type Time =
  | {
      timestamp: string;
      timeRange: undefined;
    }
  | {
      timestamp: undefined;
      timeRange: TimeRange;
    };
