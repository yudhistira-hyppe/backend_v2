export class CreateJwtrefreshtokenDto {
  

    readonly _id: { oid:String;  };
    readonly refresh_token_id: String;
    readonly  email: String;
    readonly  iat: {numberLong:String};
      readonly  exp: {numberLong:String};
      readonly  userAuth: {
        ref: String;
        id:{ oid:String;  };
      }
    readonly _class:String;
  }