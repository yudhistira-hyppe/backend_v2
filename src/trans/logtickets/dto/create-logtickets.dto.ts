export class CreateLogticketsDto {


    readonly _id: { oid: string; };
    ticketId: { oid: String; };
    userId: { oid: String; };
    type: string;
    remark: string;
    createdAt: string;
    email: string;

}