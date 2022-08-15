import { Double } from "mongodb";
import mongoose from "mongoose";

export class CreateUserAdsDto {
    _id: mongoose.Types.ObjectId;
    adsID: mongoose.Types.ObjectId;
    clickAt: String;
    createdAt: String; 
    description: String;
    priority: String;
    statusClick: String;
    statusView: String;
    updatedAt: String;
    userID: mongoose.Types.ObjectId;
    viewAt: String;
    viewed: Double;
    liveAt: string;
}