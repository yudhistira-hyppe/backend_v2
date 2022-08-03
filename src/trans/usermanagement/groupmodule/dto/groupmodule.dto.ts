import { ObjectId } from "mongoose";

export class GroupModuleDto {
  readonly _id: ObjectId;
  group: String;
  module: String;
  createAcces: boolean;
  updateAcces: boolean;
  deleteAcces: boolean;
  viewAcces: boolean;
  createAt?: String = new Date().toString();
  updateAt?: String = new Date().toString();
  desc: String;
}