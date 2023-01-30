import mongoose from "mongoose";

export class CreateAssetsFilterDto {
    _id: mongoose.Types.ObjectId;
    namafile: string;
    thumnail: string;
    link: string;
}


export class UpdateAssetsFilterDto {
    assets: mongoose.Types.ObjectId[];
}