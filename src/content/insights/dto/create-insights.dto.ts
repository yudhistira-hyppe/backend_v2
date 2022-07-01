import { Int32 } from "mongodb";

export class CreateInsightsDto {
  _id: String;
  insightID: String;
  active: boolean;
  createdAt: String;
  updatedAt: String;
  email: String;
  followers: Int32;
  followings: Int32;
  unfollows: Int32;
  likes: Int32;
  views: Int32;
  comments: Int32;
  posts: Int32;
  shares: Int32;
  reactions: Int32;
  _class: String;
}
