import mongoose, { ObjectId } from "mongoose";

export class GroupDto {
  readonly _id: ObjectId;
  nameGroup: String;
  userbasics: Array<ObjectId>;
  divisionId: mongoose.Types.ObjectId;
  createAt: String;
  updateAt: String;
  desc: String;
}