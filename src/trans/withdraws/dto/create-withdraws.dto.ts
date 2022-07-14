export class CreateWithdrawsDto {
    readonly _id: { oid: string; };
    idUser: { oid: String; };
    amount: number;
    status: string;
    bankVerificationCharge: { oid: String; };
    bankDisbursmentCharge: { oid: String; };
    accountBalanceid: { oid: String; };
    timestamp: string;
    verified: boolean;
    expired: string;
    description: string;
    statusOtp: string;
}