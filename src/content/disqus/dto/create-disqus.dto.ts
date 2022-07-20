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

export class QueryDiscusDto{
  isQuery: boolean;
  eventType: String;
  email: String;
  receiverParty: String;
  withDetail: boolean;
  detailOnly: boolean;
  pageRow: String;
  pageNumber: String;
  postID: String;
}