export class CreateFsfilesDto {
  

    readonly _id: { oid:String;  };
    readonly filename:String;
    readonly length: { numberLong:String;  };
    readonly chunkSize:Number;
    readonly uploadDate: { date:{ numberLong:String;  } };
    readonly metadata: { 
        repo_type:String;
        fileName:String;
        flow:String;
        _class:String;
    };
  }