import { Double } from "mongodb";
import mongoose from "mongoose";

export class CreateUserAdsDto {
    _id: mongoose.Types.ObjectId;
    adsID: mongoose.Types.ObjectId;
    clickAt: String;
    createdAt: String;
    description: String;
    priority: String;
    priorityNumber: number;
    statusClick: boolean;
    statusView: boolean;
    updatedAt: String;
    liveTypeuserads: boolean;
    userID: mongoose.Types.ObjectId;
    viewAt: String;
    viewed: number;
    cliked: number;
    viewedUnder: number;
    liveAt: string;
    adstypesId: mongoose.Types.ObjectId;
    nameType: string;
    timeViewSecond: number;
    isActive: boolean;
    updateAt: String[];
    clickTime: String[];
    timeView: number[];
    scoreAge: number;
    scoreGender: number;
    scoreInterest: number;
    scoreGeografis: number;
    scoreTotal: number;

}