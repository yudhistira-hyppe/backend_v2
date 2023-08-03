import mongoose from "mongoose";

export class CreateAssetsFilterDto {
    _id: mongoose.Types.ObjectId;
    namafile: string;
    descFile: string;
    iconFile: string;

    fileAssetName: String;
    fileAssetBasePath: String;
    fileAssetUri: String;

    mediaName: String;
    mediaBasePath: String;
    mediaUri: String;

    mediaThumName: String;
    mediaThumBasePath: String;
    mediaThumUri: String;

    status: boolean;
}


export class UpdateAssetsFilterDto {
    assets: mongoose.Types.ObjectId[];
}