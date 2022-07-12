import { ObjectId } from "mongodb";

export class CreateDevicelogDto {
    _id: ObjectId;
    email: String;
    imei: String;
    log: string;
    type: string;
    createdAt: String;
    updatedAt: String;
    _class:String;
  }