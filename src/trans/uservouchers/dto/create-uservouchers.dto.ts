export class CreateUservouchersDto {


    //readonly _id: { oid: String; };
    userID: { oid: String; };
    voucherID: { oid: String; };
    createdAt: string;
    isActive: boolean;
    usedCredit: number;
    voucherCredit: number;
    totalCredit: number;
    updatedAt: string;
    expiredAt: string;
    jmlVoucher: number;
    kredit: number;
    kreditFree: number; 
    useKredit: number;
    useKreditFree: number;

}