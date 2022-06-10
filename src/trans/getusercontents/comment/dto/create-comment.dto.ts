export class CreateCommentDto {


    readonly _id: String;
    readonly disqusID: String;
    readonly sequenceNumber: Number;
    readonly sender: String;
    readonly receiver: String;
    readonly active: boolean;
    readonly eventInsight: String;
    readonly postType: String;
    readonly postID: String;
    readonly createdAt: String;
    readonly updatedAt: String;
    readonly reactionUri: String;

    readonly medias: [{
        createdAt: String;
        mediaBasePath: String;
        postType: String;
        mediaUri: String;
        description: String;
        active: boolean;
        mediaType: String;
        postID: String;
        mediaEndpoint: String;
    }];
    readonly replyLogs: [];
    readonly _class: String;
}