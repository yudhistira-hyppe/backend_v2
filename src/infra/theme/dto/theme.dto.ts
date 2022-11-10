import mongoose from "mongoose";

export class ThemeDto {
  _id: mongoose.Types.ObjectId;
  name: String;
  langIso: String;
  icon: String;
  createdAt: String
  updatedAt: String
}