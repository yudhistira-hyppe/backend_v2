export class CreateCorevaluesDto {
  

    readonly _id: { oid:String;  };
    readonly  event: String;
    readonly json_schema: String;
    readonly  category: String;
    readonly  activityType: String;
    readonly  core_type: String;
    readonly  payload: Array<Object>;
    
  }