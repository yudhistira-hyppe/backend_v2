export class CreateMediavideosDto {
  

    readonly _id: String;
    readonly mediaID: String;
    readonly postID: String;
    readonly active: boolean;
    readonly createdAt: String;
    readonly updatedAt: String;
    readonly mediaType: String;
    readonly mediaBasePath: String;
    readonly mediaUri: String;
    readonly mediaThumb: String;
    readonly originalName: String;
    readonly fsSourceUri: String;
    readonly fsSourceName: String;
    readonly fsTargetUri: String;
    readonly fsTargetThumbUri: String;
    readonly mediaMime: String;
    readonly rotate: Number;
    readonly _class:String;
  }