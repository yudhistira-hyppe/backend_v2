export class CreateNewPostDTO {
  _id:String;
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
}