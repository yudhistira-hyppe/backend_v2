export class CreateUserticketsDto {


  readonly _id: { oid: string; };
  nomortiket: string;
  subject: string;
  body: string;
  datetime: string;
  IdUser: { oid: String; };
  status: string;
  tipe: string;
  active: boolean;



}