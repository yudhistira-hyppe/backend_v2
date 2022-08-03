import { ObjectId } from "mongoose";

export class ModuleDto {
  readonly _id: ObjectId;
  nameModule: String;
  createAt: String;
  updateAt: String;
  desc: String;
}