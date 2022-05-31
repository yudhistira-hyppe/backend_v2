export class CreateDisqusDto {
  

    readonly _id: String;
    readonly disqusID: String;
    readonly email: String;
    readonly mate: String;
    readonly eventType: String;
    readonly active: boolean;
    readonly room: String;
    readonly  createdAt: String;
    readonly  updatedAt: String;
    readonly  lastestMessage: String;
    readonly  disqusLogs: [{
        ref:String;
        id:String;
        db:String;
    }];
    readonly _class:String;
  }