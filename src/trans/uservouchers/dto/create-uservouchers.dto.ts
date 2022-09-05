export class CreateUservouchersDto {


    //readonly _id: { oid: String; };
    userID: { oid: String; };
    voucherID: { oid: String; };
    createdAt: string;
    isActive: boolean;
    voucherCredit: number;
    totalCredit: number;
    updatedAt: string;
    expiredAt: string;
    jmlVoucher: number;
    credit: number;
    creditFree: number;
    usedCredit: number;
    usedCreditFree: number;

}