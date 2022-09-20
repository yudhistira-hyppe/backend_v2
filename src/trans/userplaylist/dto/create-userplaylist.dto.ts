import { IsNotEmpty, IsString } from "class-validator";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

export class CreateUserplaylistDto {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  interestId: [{
    $ref: String;
    $id: ObjectId;
    $db: String;
  }];
  interestIdCount: number;
  userPostId: mongoose.Types.ObjectId;
  postType: String;
  mediaId: String;
  type: String;
  createAt: String;
  updatedAt: String;
  isWatched: boolean;
  isHidden: boolean;
}