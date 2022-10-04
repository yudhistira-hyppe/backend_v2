import { IsNotEmpty, IsString } from "class-validator";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

export class CreateUserplaylistDto {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  interestId: any[];
  interestIdCount: number;
  userPostId: mongoose.Types.ObjectId;
  postType: String; 
  postID: String;
  description: String; 
  expiration: Number;
  mediaId: String;
  type: String;
  createAt: String;
  updatedAt: String;
  isWatched: boolean;
  isHidden: boolean;
  apsara: boolean;
  mediaThumbUri: String;
  mediaEndpoint: String;
  mediaThumbEndpoint: String;
  mediaType: String;
}