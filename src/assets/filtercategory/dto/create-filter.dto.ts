import mongoose from "mongoose";

export class CreateFilterDto {
    _id: mongoose.Types.ObjectId;
    name: String;
    active: Boolean;
    createdAt: String;
    updatedAt: String;
}