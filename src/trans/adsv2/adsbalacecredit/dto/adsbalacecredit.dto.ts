import mongoose from "mongoose";

export class AdsBalaceCreditDto {
    readonly _id: { oid: String; };
    iduser: mongoose.Types.ObjectId;
    debet: number;
    kredit: number;
    type: String;
    timestamp: String;
    description: String;
    idtrans: mongoose.Types.ObjectId;
}