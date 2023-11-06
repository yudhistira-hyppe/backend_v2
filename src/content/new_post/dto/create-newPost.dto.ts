export class CreateNewPostDTO {
  _id: String;
  postID: String;
  email: String;
  postType: String;
  description: String;
  active: Boolean;
  createdAt: String;
  updatedAt: String;
  expiration:
    {
      numberLong: String
    };
  visibility: String;
  location: String;
  tags: any[];
  allowComments: Boolean;
  isSafe: Boolean;
  isOwned: Boolean;
  likes: {
    numberLong: String
  }
  views: {
    numberLong: String
  }
  shares: {
    numberLong: String
  }
  saleLike: Boolean;
  saleView: Boolean;
  saleAmount: number;
  userProfile: any;
  category: any[];
  tagPeople: any[];
  tagDescription: any[];
  contentMedias: any[];
  boosted: any[];
  viewer: any[];
  userView: any[];
  userLike: any[];
  _class: any[];
  mediaBasePath: any[];
  mediaUri: any[];
  originalName: any[];
  fsSourceUri: any[];
  fsTargetUri: any[];
  mediaMime: any[];
  descMigration: any[];
  statusMigration: any[];
  apsara: any[];
  mediaThumBasePath: any[];
  mediaThumUri: any[];
  uploadSource: any[];
  reactions: number;
  rotate: number;
  apsaraId: string;
}

export class CreatenewPost2Dto {


  _id: String;
  contentEventID: String;
  email: String;
  eventType: String;
  active: boolean;
  event: String;
  createdAt: String;
  updatedAt: String;
  postID: String;
  senderParty: String;
  sequenceNumber: Number;
  flowIsDone: boolean;
  _class: String;
  receiverParty: String;
  skip: number;
  limit: number;
}