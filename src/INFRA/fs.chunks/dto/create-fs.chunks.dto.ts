export class CreateFschunksDto {
  

    readonly _id: { oid:String;  };
    readonly files_id: { oid:String;  };
    readonly n: Number;
    readonly data: { 
        binary:{
        base64:String;
        subType:String;
     }  
    };
  }