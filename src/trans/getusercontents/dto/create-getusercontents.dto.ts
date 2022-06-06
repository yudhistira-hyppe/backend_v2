export class CreateGetusercontentsDto {
  

    readonly _id: String;
    readonly postID: String;
    readonly email: String;
    readonly postType: String;
    readonly description: String;
    readonly active: boolean;
    readonly  createdAt: String;
    readonly  updatedAt: String;
    readonly expiration: {
        numberLong:String;
    };
    readonly  visibility: String;
    readonly  location: String;
    readonly  tags: [];
    readonly allowComments: boolean;
    readonly isSafe: boolean;
    readonly isOwned: boolean;
    readonly metadata: {
        duration: Number;
        postRoll: Number;
        postType: String;
        preRoll: Number;
        midRoll: Number;
        postID: String;
        email: String;
    };

    readonly likes: {
        numberLong:String;
    };
    readonly views: {
        numberLong:String;
    };
    readonly shares: {
        numberLong:String;
    };
   
    readonly comments: {
        numberLong:String;
    };
    readonly userProfile: {
        ref: String;
        id: {
          oid: String;
        };
        db:String;
    };
   
   
    readonly contentMedias:[ {
        ref: String;
        id:String;
        db:String;
    }];
    readonly _class:String;
  }