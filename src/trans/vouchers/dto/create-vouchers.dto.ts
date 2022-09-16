export class CreateVouchersDto {

    _id: { oid: String; };
    noVoucher: string;
    codeVoucher: string;
    userID: { oid: String; };
    nameAds: string;
    creditValue: number;
    creditPromo: number;
    creditTotal: number;
    createdAt: string;
    updatedAt: string;
    expiredAt: string;
    amount: number;
    totalUsed: number;
    isActive: boolean;
    description: string;
    qty: number;
    pendingUsed: number;
}