export class CreateUserticketsDto {


  readonly _id: { oid: string; };
  nomortiket: string;
  subject: string;
  body: string;
  datetime: string;
  IdUser: { oid: String; };
  status: string;
  active: boolean;
  isRead: boolean;
  levelTicket: { oid: String; };
  sourceTicket: { oid: String; };
  assignTo: { oid: String; };
  categoryTicket: { oid: String; };
  mediaType: String;
  mediaBasePath: String;
  mediaUri: any[];
  originalName: any[];
  fsSourceUri: any[];
  fsSourceName: any[];
  fsTargetUri: any[];
  mediaMime: string;
  version: number;
  OS: string;

}