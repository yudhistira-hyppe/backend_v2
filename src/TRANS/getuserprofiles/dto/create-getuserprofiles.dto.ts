export class CreateGetuserprofilesDto {
  

    readonly _id: { oid:String;  };
    readonly profileID: String;
    readonly  email: String;
    readonly  fullName: String;
    readonly  dob: String;
    readonly  gender: String;
    readonly  mobileNumber: String;
    readonly  status: String;
    readonly  event: String;
    readonly  idProofName: String;
    readonly  idProofNumber: String;
    readonly  idProofStatus: String;
    readonly isComplete: boolean;
    readonly isCelebrity: boolean;
    readonly isIdVerified: boolean;
    readonly isPrivate: boolean;
    readonly isFollowPrivate: boolean;
    readonly isPostPrivate: boolean;
    readonly  createdAt: String;
    readonly  updatedAt: String;
    readonly bio:String;
    readonly profilePict:{
      ref:String;
      id:String;
      db:String;
    };
    readonly proofPict:{
      ref:String;
      id:String;
      db:String;
    };
    readonly insight:{
      ref:String;
      id:String;
      db:String;
    };
    readonly userInterests:[
      {
        ref:String;
        id:{
          oid: String;
        };
        db:String;
      }
    ];
    readonly userAuth:{
      ref:String;
      id:{
        oid:String;
      };
      db:String;
    };
    readonly cities:{
      ref:String;
      id:{
        oid:String;
      };
      db:String;
    };
    readonly states:{
      ref:String;
      id:{
        oid:String;
      };
      db:String;
    };
    readonly countries:{
      ref:String;
      id:{
        oid:String;
      };
      db:String;
    };
    readonly languages:{
      ref:String;
      id:{
        oid:String;
      };
      db:String;
    };
    readonly _class:String;
  }