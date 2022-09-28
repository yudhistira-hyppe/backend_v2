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
    liveAt: string;
    adstypesId: mongoose.Types.ObjectId;
    nameType: string;

}