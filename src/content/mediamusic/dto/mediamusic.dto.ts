import mongoose from "mongoose";

export class MediamusicDto {
  _id: mongoose.Types.ObjectId;
  musicTitle: String
  artistName: String
  albumName: String
  releaseDate: Date
  genre: mongoose.Types.ObjectId;
  theme: mongoose.Types.ObjectId;
  mood: mongoose.Types.ObjectId;
  isDelete: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  used: number;
  apsaraMusic: String;
  apsaraThumnail: String
}