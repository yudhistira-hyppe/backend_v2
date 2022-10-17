import { PostAgentProfileRequest } from "aws-sdk/clients/codeguruprofiler";
import { List } from "aws-sdk/lib/model";
import { CreatePostsDto } from "src/content/posts/dto/create-posts.dto";

export class CreateDisqusDto {
  

     _id: String;
     disqusID: String;
     email: String;
     mate: String;
     eventType: String;
     active: boolean;
     room: String;
      createdAt: String;
      updatedAt: String;
      lastestMessage: String;
    emailActive: boolean; 
    mateActive: boolean;
      disqusLogs: [{
        ref:String;
        id:String;
        db:String;
    }];
     _class:String;
  }

export class ContentDto {
  postID: String;
  email: String;
  disqusID: String;
  disqusLogID: String;
  eventDisqus: String;
  eventInsight: String;
  txtMessages: String;
  parentID: String;
  active: boolean;

  reactionUri: String;
  eventType: String;
  replyEventType: String;
  senderParty: String;
  receiverParty: String;
  senderOrReceiver: String;

  contentPost: CreatePostsDto;

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