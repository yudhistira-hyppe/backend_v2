// export class CreateInterestsRepoDto {


//   readonly _id: { oid: String; };
//   readonly interestName: String;
//   readonly langIso: String;
//   readonly icon: string;
//   readonly createdAt: String;
//   readonly updatedAt: String;
//   readonly _class: String;
//   readonly interestNameId: string;
//   readonly thumbnail: string;
// }

import mongoose from "mongoose";
export class CreateInterestsRepoDto {
  _id: mongoose.Types.ObjectId;
  interestName: String;
  langIso: String;
  icon: string;
  createdAt: String;
  updatedAt: String;
  _class: String;
  interestNameId: string;
  thumbnail: string;
}