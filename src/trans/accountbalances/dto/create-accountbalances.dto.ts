import mongoose from "mongoose";

export class CreateAccountbalancesDto {


    readonly _id: { oid: String; };
    iduser: { oid: String; };
    debet: number;
    kredit: number;
    type: String;
    timestamp: String;
    description: String;
    idtrans: mongoose.Types.ObjectId;


}