export class CreateUserticketsDto {
  

    // readonly _id: { oid:string;  };
     subject: string;
      body: string;
      datetime: string;
     IdUser: { oid:String;  };
      status: string;
     Detail:[{
     IDUser:{ oid:String;  };
    body: string;
    datetime: string;
    status: string;
    }];

  }