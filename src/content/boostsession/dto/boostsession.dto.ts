import mongoose from "mongoose";

export class BoostsessionDto {
  _id: mongoose.Types.ObjectId;
  name: String;
  start: String;
  end: String;
}


