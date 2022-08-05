export class CreateUservouchersDto {


    readonly _id: { oid: String; };
    userID: { oid: String; };
    voucherID: { oid: String; };
    createdAt: string;
    isActive: boolean;
    totalCredit: number;
    updatedAt: string;

}