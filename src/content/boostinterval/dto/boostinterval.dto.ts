import mongoose, { ObjectId } from "mongoose";

export class BoostintervalDto {
  _id: mongoose.Types.ObjectId;
  value: String;
  remark: String;
  type: String;
}


