import mongoose from "mongoose";

export class MoodDto {
  _id: mongoose.Types.ObjectId;
  name: String;
  langIso: String;
  icon: String;
  createdAt: String
  updatedAt: String
}