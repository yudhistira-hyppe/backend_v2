import mongoose from "mongoose";

export class CreateNewPostDTO {
  _id: String;
  postID: String;
  email: String;
  postType: String;
  description: String;
  active: boolean;
  createdAt: String;
  updatedAt: String;
  certified: boolean;
  isBoost: number;
  expiration:
    {
      numberLong: String
    };
  visibility: String;
  location: String;
  tags: any[];
  allowComments: boolean;
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
  saleLike: boolean;
  saleView: boolean;
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
  reportedStatus: string;
  reportedUserCount:number;
  metadata:Metadata;
  mediaSource:any[];
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

export class Messages {
  info: string[];
}

export class Metadata {
  postType: string;
  duration: number;
  postID: string;
  email: string;
  postRoll: number;
  midRoll: number;
  preRoll: number;
  width: Number;
  height: Number;
}

export class Cat {
  _id: string;
  interestName: string;
  langIso: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export class Avatar {
  mediaBasePath: string;
  mediaUri: string;
  mediaType: string;
  mediaEndpoint: string;
}

export class TagPeople {
  avatar: Avatar;
  email: string;
  username: string;
  status: string;
  urluserBadge: any[];
}

export class Privacy {
  isPostPrivate: boolean;
  isIdVerified: boolean;
  isCelebrity: boolean;
  isPrivate: boolean;
}

export class InsightPost {
  follower: number;
  following: number;
  likes: number;
  views: number;
  shares: number;
  comments: number;
  reactions: number;
}

export class PostData {
  _id: string;
  rotate: number;
  metadata: Metadata;
  description: string;
  postID: string;
  title: string;
  createdAt: string;
  certified: boolean;
  saleLike: boolean;
  isShared: boolean;
  email: string;
  updatedAt: string;
  saleAmount?: any;
  visibility: string;
  mediaBasePath?: any;
  postType: string;
  isApsara: boolean;
  mediaUri?: any;
  active: boolean;
  mediaType: string;
  saleView: boolean;
  mediaThumbEndpoint: string;
  tags: string[];
  allowComments: boolean;
  cats: Cat[];
  tagPeople: TagPeople[];
  mediaThumbUri?: any;
  location?: any;
  mediaEndpoint: string;
  privacy?: Privacy;
  username: string;
  isIdVerified: boolean;
  apsaraId: string;
  apsaraThumbId: string;
  insight: InsightPost;
  isViewed: boolean;
  isLiked: boolean;
  avatar: Avatar;
  boostViewer: any[];
  musicId: mongoose.Types.ObjectId;
  boosted: any[];
  boostCount: number;
  isBoost: number;
  boostJangkauan: number;
  statusBoost: string;
  music: any;
  apsaraMusic: string;
  apsaraThumnail: string;
  reportedStatus: string;
  reportedUserCount: number;
  viewer: any[];
  comment: any[];
  comments: number;
  following: boolean;
  urluserBadge: any[];
  stiker: any[];
  text: any[];
}

export class PostResponseApps {
  response_code: number;
  data: PostData[];
  messages: Messages;
  version: string;
}