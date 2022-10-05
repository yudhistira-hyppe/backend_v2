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
  isApsara: boolean;
  mediaThumbUri: String;
  mediaEndpoint: String;
  mediaThumbEndpoint: String;
  mediaType: String;
  viewers: any[];
  userBasicData: Object;
  postData: Object;
  mediaData: Object;
}

export class MediaData {
  _id: string;
  mediaID: string;
  postID: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  mediaType: string;
  originalName: string;
  mediaMime: string;
  _class: string;
  apsara: boolean;  
  apsaraId: string;  
}
