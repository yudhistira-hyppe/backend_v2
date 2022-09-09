export class CreateMediaproofpictsDto {


  _id: String;
  mediaID: String;
  active: boolean;
  valid: boolean;
  createdAt: String;
  updatedAt: String;
  postType: String;
  mediaType: String;
  mediaBasePath: String;
  mediaUri: String;
  originalName: String;
  fsSourceUri: String;
  fsSourceName: String;
  fsTargetUri: String;
  mediaMime: String;


  idcardnumber: String;
  nama: String;
  tempatLahir: String;
  jenisKelamin: String;
  alamat: String;
  agama: String;
  statusPerkawinan: String;
  pekerjaan: String;
  kewarganegaraan: String;
  mediaSelfieType: String;
  mediaSelfieBasePath: String;
  mediaSelfieUri: String;
  SelfieOriginalName: String;
  SelfiefsSourceUri: String;
  SelfiefsSourceName: String;
  SelfiefsTargetUri: String;
  SelfiemediaMime: String;

  mediaSupportType: String;
  mediaSupportBasePath: String;
  mediaSupportUri: any[];
  SupportOriginalName: any[];
  SupportfsSourceUri: any[];
  SupportfsSourceName: any[];
  SupportfsTargetUri: any[];
  SupportmediaMime: String;
  email: String;
  // mediaFileSuportType: String;
  // mediaFileSuportBasePath: String;
  // mediaFileSuportUri: String;
  // FileSuportOriginalName: String;
  // FileSuportfsSourceUri: String;
  // FileSuportfsSourceName: String;
  // FileSuportfsTargetUri: String;
  // FileSuportmediaMime: String;
  status: String;
  description: String;

  _class: String;
  userId: {
    $ref: String;
    $id: { oid: String };
    $db: String;
  };
  state: String;
}