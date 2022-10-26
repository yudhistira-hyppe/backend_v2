export class CreateTemplatesDto {
  

    readonly _id: { oid:String;  };
    readonly  name: String;
    readonly event: String;
    readonly  subject: string;
    readonly  from: string;
    readonly  body_detail: string;
    readonly  status: string;
    readonly  type: String;
    readonly  langIso: String;
    readonly category:String;
    readonly action_buttons:String;
    body_detail_id: String
  }