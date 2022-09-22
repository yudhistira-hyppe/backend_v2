import { Long } from "mongodb";

export class CreateInsightsDto {
  _id: String;
  insightID: String;
  active: boolean;
  createdAt: String;
  updatedAt: String;
  email: String;
  followers: Long;
  followings: Long;
  unfollows: Long;
  likes: Long;
  views: Long;
  views_profile: Long;
  comments: Long;
  posts: Long;
  shares: Long;
  reactions: Long;
  _class: String;
}
