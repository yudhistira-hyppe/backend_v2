export class CreateAnnouncementsDto {


    // readonly _id: { oid:string;  };
    title: string;
    body: string;
    datetimeCreate: string;
    datetimeSend: string;
    pushMessage: boolean;
    appMessage: boolean;
    appInfo: boolean;
    email: boolean;
    idusershare: { oid: String; };
    status: string;
    detail: [{ iduser: { oid: String; }; }]


}