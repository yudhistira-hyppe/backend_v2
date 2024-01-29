import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Long } from "mongodb";

export type PostsReadDocument = PostsRead & Document;

// @Schema({ collection: 'posts' })
// export class PostsRead {
//   @Prop()
//   _id: String;
//   @Prop()
//   postID: String
//   @Prop()
//   email: String
//   @Prop()
//   postType: String
//   @Prop()
//   description: String
//   @Prop()
//   active: boolean
//   @Prop()
//   createdAt: String
//   @Prop()
//   updatedAt: String
//   @Prop()
//   expiration: Long;
//   @Prop()
//   visibility: String
//   @Prop()
//   location: String
//   @Prop()
//   tags: any[]
//   @Prop()
//   allowComments: boolean
//   @Prop()
//   isSafe: boolean
//   @Prop()
//   isOwned: boolean
//   @Prop()
//   certified: boolean
//   @Prop()
//   saleAmount: number
//   @Prop()
//   saleLike: boolean
//   @Prop()
//   isShared: boolean
//   @Prop()
//   saleView: boolean
//   @Prop({ type: Object })
//   metadata: {
//     duration: Number
//     postRoll: Number
//     postType: String
//     preRoll: Number
//     midRoll: Number
//     postID: String
//     email: String
//     width: Number
//     height: Number
//   }
//   @Prop()
//   likes: Long;
//   @Prop()
//   views: Long;
//   @Prop()
//   shares: Long;
//   @Prop()
//   comments: Long;
//   @Prop()
//   reactions: Long;
//   @Prop({ type: Object })
//   userProfile: any;
//   @Prop()
//   contentMedias: any[];
//   @Prop()
//   _class: String
//   @Prop()
//   lat: number;
//   @Prop()
//   lon: number;
//   @Prop()
//   category: any[];
//   @Prop()
//   tagPeople: any[];
//   @Prop()
//   tagDescription: any[];
//   @Prop()
//   reportedStatus: string
//   @Prop()
//   reportedUserCount: number
//   @Prop()
//   reportedUser: any[];
//   @Prop()
//   contentModeration: boolean
//   @Prop()
//   contentModerationResponse: string
//   @Prop()
//   contentModerationDate: string
//   @Prop()
//   reportedUserHandle: any[];
//   @Prop({ type: Object })
//   musicId: mongoose.Types.ObjectId;
//   @Prop()
//   boosted: any[];
//   @Prop()
//   boostCount: number;
//   @Prop()
//   isBoost: number;
//   @Prop()
//   apsaraThumnail: string;
//   @Prop()
//   statusCB: string;
//   @Prop()
//   moderationReason: string;
//   @Prop()
//   viewer: any[];
//   @Prop()
//   stiker: any[];
//   @Prop()
//   text: any[];
// }
@Schema({ collection: 'newPosts' })
export class PostsRead {
  //POST
  @Prop()
  _id: String;
  @Prop()
  postID: String;
  @Prop()
  email: String;
  @Prop()
  postType: String;
  @Prop()
  description: String;
  @Prop()
  active: boolean;
  @Prop()
  createdAt: String;
  @Prop()
  updatedAt: String;
  @Prop()
  expiration: Long;
  @Prop()
  visibility: String;
  @Prop()
  location: String;
  @Prop()
  tags: any[];
  @Prop()
  allowComments: boolean;
  @Prop()
  isSafe: boolean;
  @Prop()
  isOwned: boolean;
  @Prop()
  likes: Long;
  @Prop()
  views: Long;
  @Prop()
  shares: Long;
  @Prop()
  comments: Long;
  @Prop()
  reactions: Long;
  @Prop({ type: Object })
  userProfile: any;
  @Prop()
  contentMedias: any[];
  @Prop()
  viewer: any[];
  @Prop({ type: Object })
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
  @Prop()
  isCertified: boolean;
  @Prop()
  boosted: any[];
  @Prop()
  isShared: boolean
  @Prop()
  category: any[];
  @Prop()
  certified: boolean
  @Prop()
  saleAmount: number;
  @Prop()
  saleLike: boolean;
  @Prop()
  saleView: boolean;
  @Prop()
  tagDescription: any[];
  @Prop()
  tagPeople: any[];
  @Prop()
  contentModerationDate: string
  @Prop()
  moderationReason: string;
  @Prop()
  statusCB: string;
  @Prop()
  isBoost: number;
  @Prop()
  contentModeration: boolean
  @Prop()
  contentModerationResponse: string
  @Prop()
  reportedStatus: string
  @Prop()
  reportedUserHandle: any[];
  @Prop({ type: Object })
  musicId: mongoose.Types.ObjectId;
  @Prop()
  reportedUser: any[];
  @Prop()
  reportedUserCount: number
  @Prop()
  stiker: any[];
  @Prop()
  text: any[];
  @Prop()
  lat: number;
  @Prop()
  lon: number;
  @Prop()
  _class: String

  //CONTENT EVENT
  @Prop()
  userView: any[];
  @Prop()
  userLike: any[];
  //MEDIA
  @Prop()
  mediaSource: any[];

  //Buat guest mode
  @Prop()
  tempView: any[];
  @Prop()
  tempLike: any[];
  @Prop()
  boostCount: number;
}
export const PostsReadSchema = SchemaFactory.createForClass(PostsRead);