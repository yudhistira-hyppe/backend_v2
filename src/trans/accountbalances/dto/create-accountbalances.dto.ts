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


export class CreateAccountbalances{
    readonly _id: mongoose.Types.ObjectId;
    iduser: mongoose.Types.ObjectId;
    debet: number;
    kredit: number;
    type: String;
    timestamp: String;
    description: String;
    idtrans: mongoose.Types.ObjectId;


}