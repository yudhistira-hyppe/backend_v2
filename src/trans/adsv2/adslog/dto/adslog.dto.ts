import { double } from "aws-sdk/clients/lightsail";
import { IsNotEmpty } from "class-validator";
import mongoose, { ObjectId } from "mongoose";

export class AdsLogsDto {
    _id: mongoose.Types.ObjectId;
    iduser: mongoose.Types.ObjectId;
    nameActivitas: string[];
    desc: string;
    type: string;
    dateTime: string;
    requestAds: string;
    responseAds: string;
    endPointAds: string;
}