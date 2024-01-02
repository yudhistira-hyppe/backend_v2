import mongoose from "mongoose";

export class CreateAssetsFilterDto {
    _id: mongoose.Types.ObjectId;
    namafile: string;
    descFile: string;

    fileAssetName: String;
    fileAssetBasePath: String;
    fileAssetUri: String;

    mediaName: String;
    mediaBasePath: String;
    mediaUri: String;

    mediaThumName: String;
    mediaThumBasePath: String;
    mediaThumUri: String;

    active: boolean;
    status: boolean;
    category_id: mongoose.Types.ObjectId;
    createdAt: string;
    updatedAt: string;
}


export class UpdateAssetsFilterDto {
    assets: mongoose.Types.ObjectId[];
}