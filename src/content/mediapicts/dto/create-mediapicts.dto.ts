export class CreateMediapictsDto {
  

    readonly _id: String;
    readonly mediaID: String;
    readonly postID: String;
    readonly active: boolean;
    readonly createdAt: String;
    readonly updatedAt: String;
    readonly mediaType: String;
    readonly mediaBasePath: String;
    readonly mediaUri: String;
    readonly originalName: String;
    readonly fsSourceUri: String;
    readonly fsSourceName: String;
    readonly fsTargetUri: String;
    readonly mediaMime: String;
  readonly _class: String;
    uploadSource: String;
    mediaThumName: String;
    mediaThumBasePath: String;
    mediaThumUri: String;
  }