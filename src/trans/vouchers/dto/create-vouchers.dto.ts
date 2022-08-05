export class CreateVouchersDto {

    readonly _id: { oid: String; };
    codeVoucher: string;
    userID: { oid: String; };
    nameAds: string;
    creditValue: number;
    creditPromo: number;
    creditTotal: number;
    createdAt: string;
    updateAt: string;
    expiredAt: string;
    amount: number;
    totalUsed: number;
    isActive: boolean;
}