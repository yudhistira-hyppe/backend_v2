export class CreateActivityeventsDto {
  

    readonly _id: { oid:String;  };
    readonly activityEventID: String;
    readonly  activityType: String;
    readonly  active: boolean;
    readonly  status: String;
    readonly  target: String;
    readonly  payload: {
        login_location:{
            latitude:String;
            longitude:String;
        }
        logout_date:String;
        login_date:String;
        login_device:String;
        email:String;
    };
    readonly  createdAt: String;
    readonly  updatedAt: String;
    readonly  sequenceNumber: String;
    readonly  flowIsDone: boolean;
    readonly  transitions: [
    {
        ref:String;
        id:String;
        db:String;
    }
    ];
    readonly _class:String;
  }