export class CreateLogapiDto {
    _id: { oid: String; };    
    url: String;
    timestamps_start: String;
    timestamps_end: String;
    email: String;
    iduser: String;
    username: String;
    requestBody: any[];
}
