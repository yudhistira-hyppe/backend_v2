export class CreateDisquscontactsDto {
  

     _id: String;
     active: boolean;
     email: String;
     mate: String;
      disqus: {
        $ref:String;
        $id:String;
        $db:String;
    };
     _class:String;
  }