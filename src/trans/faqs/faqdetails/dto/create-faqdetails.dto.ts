

export class CreateFaqdetailsDto {


    // readonly _id: { oid:string;  };

    Idfaqs: { oid: String; };
    title: string;
    body: string;
    datetime: string;
    IdUser: { oid: String; };
    active: boolean;


}