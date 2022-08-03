import { ObjectId } from "mongoose";

export class GroupDto {
  readonly _id: ObjectId;
  nameGroup: String;
  userbasics: Array<ObjectId>;
  createAt: String;
  updateAt: String;
  desc: String;
}