export class CreateAccountbalancesDto {


    readonly _id: { oid: String; };
    iduser: { oid: String; };
    debet: number;
    kredit: number;
    type: String;
    timestamp: String;
    description: String;
    idtrans: { oid: String; };


}