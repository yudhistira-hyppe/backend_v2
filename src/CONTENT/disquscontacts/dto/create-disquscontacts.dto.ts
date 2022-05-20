export class CreateDisquscontactsDto {
  

    readonly _id: String;
    readonly active: boolean;
    readonly email: String;
    readonly mate: String;
    readonly  disqus: {
        ref:String;
        id:String;
        db:String;
    };
    readonly _class:String;
  }