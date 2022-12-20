import mongoose, { ObjectId } from "mongoose";

export class GroupModuleDto {
  readonly _id: mongoose.Types.ObjectId;
  group: mongoose.Types.ObjectId;
  module: mongoose.Types.ObjectId;
  createAcces: boolean;
  updateAcces: boolean;
  deleteAcces: boolean;
  viewAcces: boolean;
  createAt?: String = new Date().toString();
  updateAt?: String = new Date().toString();
  desc: String;
}

export class ValidasiGroupModuleDto {
  user: String;
  module: String;
  action: String;
}