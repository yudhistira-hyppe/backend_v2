import { PostAgentProfileRequest } from "aws-sdk/clients/codeguruprofiler";
import { List } from "aws-sdk/lib/model";
import { DisquslogsDto } from "src/content/disquslogs/dto/create-disquslogs.dto";
import { CreatePostsDto } from "src/content/posts/dto/create-posts.dto";
import { AvatarDTO } from "src/utils/data/Profile";

export class CreateDisqusDto {
  

     _id: String;
     disqusID: String;
     email: String;
     mate: String;
     eventType: String;
     active: boolean;
     room: String;
  createdAt: String;
  postID: String;
    updatedAt: String;
    lastestMessage: String;
    emailActive: boolean; 
    mateActive: boolean;
    disqusLogs: [{
      $ref:String;
      $id:String;
      $db:String;
  }];
     _class:String;
  }

export class ContentDto {
  email: String;
  postID: String;
  mediaID: String;
  disqusID: String;
  disqusLogID: String;
  eventDisqus: String;
  eventInsight: String;
  txtMessages: String;
  parentID: String;
  active: boolean;
  tagComment: String;
  tagComment_: string[];

  reactionUri: String;
  eventType: String;
  replyEventType: String;
  senderParty: String;
  receiverParty: String;
  senderOrReceiver: String;

  contentPost: CreatePostsDto;
  eventId: String;
  postType: String;
  postContent: CreatePostsDto;
  title: String;
  description: String; 
  isQuery: boolean;
  withDetail: boolean;
  detailOnly: boolean;
  pageRow: String;
  pageNumber: String;
  mate: String; 
  disqus: Array<Object>;
}

export class DisqusDto {
  

  _id: String;
  disqusID: String;
  email: String;
  mate: {};
  eventType: String;
  active: boolean;
  room: String;
  createdAt: String;
  updatedAt: String;
  lastestMessage: String;
  username: String;
  fullName: String;
  avatar: AvatarDTO;
  senderOrReceiverInfo: {};
  emailActive: boolean; 
  mateActive: boolean;
  _class:String;
}

export class DisqusResDto {
  

  _id: String;
  disqusID: String;
  email: String;
  mate: {};
  eventType: String;
  active: boolean;
  room: String;
  createdAt: String;
  updatedAt: String;
  lastestMessage: String;
  username: String;
  fullName: String;
  avatar: AvatarDTO;
  senderOrReceiverInfo: {};
  emailActive: boolean; 
  mateActive: boolean;
  postId: string;
  postType: string;
  content: any;
  disqusLogs: DisquslogsDto[];
  _class:String;
}

export class Messages {
  info: string[];
}

export class DisqusResponseApps {
  response_code: number;
  data: DisqusResDto[];
  messages: Messages;
  version: string;
}  