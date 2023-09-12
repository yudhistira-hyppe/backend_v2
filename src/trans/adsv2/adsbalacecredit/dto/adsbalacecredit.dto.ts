import mongoose from "mongoose";

export class AdsBalaceCreditDto {
    _id: mongoose.Types.ObjectId;
    iduser: mongoose.Types.ObjectId;
    debet: number;
    kredit: number;
    type: String;
    timestamp: String;
    description: String;
    idtrans: mongoose.Types.ObjectId;
    idAdspricecredits: mongoose.Types.ObjectId;
}