import { Long } from "mongodb";
import { ContentDto } from "../../../content/disqus/dto/create-disqus.dto";

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

export class InsightsDto {
  eventType: String;
  contentDto: ContentDto;
  validStep3: boolean;
  validStep4: boolean;
  prevPresent: boolean;
}
