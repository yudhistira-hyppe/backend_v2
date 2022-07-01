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

}
