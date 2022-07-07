export class CreateTransactionsDto {


    readonly _id: { oid: string; };
    noinvoice: string;
    postid: string;
    idusersell: { oid: String; };
    iduserbuyer: { oid: String; };
    amount: number;
    paymentmethod: { oid: String; };
    status: string;
    description: string;
    nova: string;
    salelike: boolean;
    saleview: boolean;
    bank: { oid: String; };
    ppn: { oid: String; };
    mdradmin: { oid: String; };
    bankvacharge: { oid: String; };
    totalamount: number;
    accountbalance: { oid: String; };
    timestamp: string;
    expiredtimeva: string;
    payload: VaCallback;

}

export class VaCallback {
    va_number: string;
    amount: number;
    partner_user_id: string;
    success: boolean;
    tx_date: string;
    username_display: string;
    trx_expiration_date: string;
    partner_trx_id: string;
    trx_id: string;
    settlement_time: string;
    settlement_status: string;
}
