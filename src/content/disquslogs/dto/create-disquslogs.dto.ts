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
  parentID: String;
    
      medias: [{
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
  replyLogs: [
    {
      $ref: String;
      $id: String;
      $db: String;
    },
  ];
  tags:[
    {
      $ref: String;
      $id: {
        oid: String
      };
      $db: String;
    },
  ];
     _class: String;
    receiverActive: boolean;
    senderActive: boolean;
  }


  export class DisquslogsDto {
  
    _id: String;
    disqusID: String;
    sequenceNumber: Number;
    sender: {};
    receiver: String;
    active: boolean;
    eventInsight: String;
    postType: String;
    postID: String;
    createdAt: String;
    updatedAt: String;
    reactionUri: String;
    txtMessages: String; 
    lineID: String;
   
    readonly _class: String;
    receiverActive: boolean;
    senderActive: boolean;
    senderInfo: {};
    replyLogs: [
      {
        $ref: String;
        $id: String;
        $db: String;
      },
    ];
 }