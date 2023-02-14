

export class CreateUserticketdetailsDto {


    // readonly _id: { oid:string;  };

    IdUserticket: { oid: String; };
    type: string;
    body: string;
    datetime: string;
    IdUser: { oid: String; };
    status: string;
    mediaType: String;
    mediaBasePath: String;
    mediaUri: any[];
    originalName: any[];
    fsSourceUri: any[];
    fsSourceName: any[];
    fsTargetUri: any[];
    mediaMime: string;
    UploadSource: string

}