import { ObjectId } from "mongoose";

export class DivisionDto {
  readonly _id: ObjectId;
  nameDivision: String;
  createAt: String;
  updateAt: String;
  desc: String;
}