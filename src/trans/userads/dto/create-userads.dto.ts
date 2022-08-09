import mongoose from "mongoose";

export class CreateUserAdsDto {
    _id: mongoose.Types.ObjectId;
    adsID: String;
    clickAt: String;
    createdAt: String; 
    description: String;
    priority: String;
    statusClick: String;
    statusView: String;
    updatedAt: String;
    userID: String;
    viewAt: String;
    viewed: String;
}