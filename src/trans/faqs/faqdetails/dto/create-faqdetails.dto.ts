

export class CreateFaqdetailsDto {


    // readonly _id: { oid:string;  };

    Idfaqs: { oid: String; };
    subject: string;
    body: string;
    datetime: string;
    IdUser: { oid: String; };
    status: string;


}