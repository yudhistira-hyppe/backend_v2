export class CreateUserauthDto {
  

    readonly _id: { oid:String;  };
    readonly username: String;
    readonly  password: string;
    readonly  userID: String;
    readonly  email: String;
    readonly  regSrc: String;
    readonly  createdAt: String;
    readonly  updatedAt: String;
    readonly isExpiryPass:Boolean;
    readonly isEmailVerified:Boolean;
    readonly otpRequestTime: { numberLong:String;  };
    readonly otpAttempt: { numberLong:String;  };
    readonly otpNextAttemptAllow: { numberLong:String;  };
    readonly isEnabled:Boolean;
    readonly isAccountNonExpired:Boolean;
    readonly isAccountNonLocked:Boolean;
    readonly isCredentialsNonExpired:Boolean;
    readonly roles:[];
    readonly devices:[{
        ref:String;
        id:{
          oid:String;
        };
        db:String;
    }];
    readonly _class:String;
  }