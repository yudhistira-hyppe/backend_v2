export class CreateDisquslogsDto {
  

     _id: String;
     disqusID: String;
     sequenceNumber: Number;
     sender: String;
     receiver: String;
     active: boolean;
     eventInsight: String;
      postType: String;
      postID: String;
      createdAt: String;
      updatedAt: String;
      reactionUri: String;
    txtMessages: String;
    
    readonly  medias: [{
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
    receiverActive: boolean;
    senderActive: boolean;
  }