

export class CreateUserticketdetailsDto {


    // readonly _id: { oid:string;  };

    IdUserticket: { oid: String; };
    type: string;
    body: string;
    datetime: string;
    IdUser: { oid: String; };
    status: string;



}