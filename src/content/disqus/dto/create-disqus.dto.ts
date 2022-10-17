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

export class QueryDiscusDto {
  postID: String;
  email: String;
  postType: String;
  postContent: CreatePostsDto; 
  title: String;
  description: String; 
  active: boolean;
  isQuery: boolean;
  eventType: String;
  receiverParty: String;
  withDetail: boolean;
  detailOnly: boolean;
  pageRow: String;
  pageNumber: String; 
  reactionUri: String;
}