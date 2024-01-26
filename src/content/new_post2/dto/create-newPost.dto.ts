import mongoose from "mongoose";
import { Long } from "mongodb";

export class CreateNewPost2DTO {
  //POST
  _id: String;
  postID: String;
  email: String;
  postType: String;
  description: String;
  active: boolean;
  createdAt: String;
  updatedAt: String;
  expiration: Long;
  visibility: String;
  location: String;
  tags: any[];
  allowComments: boolean;
  isSafe: boolean;
  isOwned: boolean;
  likes: Long;
  views: Long;
  shares: Long;
  comments: Long;
  reactions: Long;
  userProfile: any;
  contentMedias: any[];
  _class: String;
  viewer: any[];
  metadata: {
    duration: Number
    postRoll: Number
    postType: String
    preRoll: Number
    midRoll: Number
    postID: String
    email: String
    width: Number
    height: Number
  }
  isCertified: boolean;
  boosted: any[];
  isShared: boolean
  category: any[];
  certified: boolean
  saleAmount: number;
  saleLike: boolean;
  saleView: boolean;
  tagDescription: any[];
  tagPeople: any[];
  contentModerationDate: string
  moderationReason: string;
  statusCB: string;
  isBoost: number;
  contentModeration: boolean
  contentModerationResponse: string
  reportedStatus: string
  reportedUserHandle: any[];
  musicId: mongoose.Types.ObjectId;
  reportedUser: any[];
  reportedUserCount: number
  stiker: any[];
  text: any[];
  boostCount: number;
  lat: number;
  lon: number;

  //CONTENT EVENT
  userView: any[];
  userLike: any[];

  //MEDIA
  mediaSource: any[];

  //Guest mode
  tempView: any[];
  tempLike: any[];
}
export class CreatePost2Response {
  response_code: number;
  messages: Messages;
  data: any;
}

export class Metadata2 {
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

export class Cat2 {
  _id: string;
  interestName: string;
  langIso: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export class Avatar2 {
  mediaBasePath: string;
  mediaUri: string;
  mediaType: string;
  mediaEndpoint: string;
}

export class Privacy2 {
  isPostPrivate: boolean;
  isIdVerified: boolean;
  isCelebrity: boolean;
  isPrivate: boolean;
}

export class TagPeople {
  avatar: Avatar2;
  email: string;
  username: string;
  status: string;
  urluserBadge: any[];
}

export class PostData2 {
  _id: string;
  rotate: number;
  metadata: Metadata2;
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
  cats: Cat2[];
  tagPeople: TagPeople[];
  mediaThumbUri?: any;
  location?: any;
  mediaEndpoint: string;
  privacy?: Privacy2;
  username: string;
  isIdVerified: boolean;
  apsaraId: string;
  apsaraThumbId: string;
  insight: InsightPost2;
  isViewed: boolean;
  isLiked: boolean;
  avatar: Avatar2;
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

export class Messages {
  info: string[];
}

export class PostResponseApps {
  response_code: number;
  data: PostData2[];
  messages: Messages;
  version: string;
}

export class VideoList2 {
  Status: string;
  VideoId: string;
  Size: number;
  DownloadSwitch: string;
  Title: string;
  Duration: number;
  ModificationTime: Date;
  CateId: number;
  CateName: string;
  PreprocessStatus: string;
  AppId: string;
  CreationTime: Date;
  CoverURL: string;
  RegionId: string;
  StorageLocation: string;
  Snapshots: string[];
  TemplateGroupId: string;
}

export class ApsaraVideoResponse2 {
  RequestId: string;
  VideoList: VideoList2[];
}

export class Mezzanine2 {
  FileURL: string;
  OriginalFileName: string;
  Height: number;
  Width: number;
  FileSize: number;
}

export class ImageInfo2 {
  Status: string;
  Mezzanine: Mezzanine2;
  CreationTime: Date;
  ImageId: string;
  Title: string;
  RegionId: string;
  StorageLocation: string;
  URL: string;
  ImageType: string;
}

export class ApsaraImageResponse2 {
  RequestId: string;
  NonExistImageIds: any[];
  ImageInfo: ImageInfo2[];
}

export class ApsaraPlayResponse2 {
  PlayUrl: string;
  Duration: string;
}

export class InsightPost2 {
  follower: number;
  following: number;
  likes: number;
  views: number;
  shares: number;
  comments: number;
  reactions: number;
}

export class PostLandingData2 {
  video: PostData2[];
  pict: PostData2[];
  story: PostData2[];
  diary: PostData2[];
}

export class PostLandingResponseApps2 {
  response_code: number;
  data: PostLandingData2;
  messages: Messages;
  version: string;
}

export class PostBuildData2 {
  vids: string[];
  picts: string[];
  user: string[];
  interest: string[];
}

export class GetVideoPlayAuthResponse2 {
  PlayAuth: string;
  RequestId: string;
  VideoMeta: {
    Status: string;
    Duration: string;
    Title: string,
    VideoId: string,
    CoverURL: string,
  };
} 
export class CreatePostRequest2 {
  postID: string;
  postType: string;
  description: string;
  tags: string;
  visibility: string;
  allowComments: boolean;
  certified: boolean;
  cats: string;
  tagPeople: string;
  stiker: any;
  image: any;
  type: any;
  position: string;
  text: any;
  width: any;
  height: any;
  musicId: mongoose.Types.ObjectId;
  saleAmount: number;
  location: string;
  lat: number;
  lon: number;
  saleLike: boolean;
  saleView: boolean;
  isSafe: boolean;
  isOwned: boolean;
  tagDescription: string;
  isShared: boolean;
} 

export class GetcontenteventsDto2 {
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
  lang: String;
  emailView: String;
}