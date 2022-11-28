export class CreateTemplatesRepoDto {


  readonly _id: { oid: String; };
  readonly name: String;
  readonly event: String;
  readonly subject: string;
  readonly subject_id: string;
  readonly from: string;
  readonly body_detail: string;
  readonly body_detail_id: string;
  readonly status: string;
  readonly type: String;
  readonly langIso: String;
  readonly category: String;
}