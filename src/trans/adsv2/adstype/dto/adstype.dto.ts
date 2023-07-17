import { IsNotEmpty, IsNumberString } from "class-validator";
import mongoose from "mongoose";

export class AdsTypeDto {
    readonly _id: mongoose.Types.ObjectId;
    @IsNotEmpty()
    nameType: string; 
    @IsNumberString()
    @IsNotEmpty()
    CPV: number;
    @IsNumberString()
    @IsNotEmpty()
    CPA: number;
    @IsNotEmpty()
    rewards: number;
    @IsNotEmpty()
    durationMax: number;
    @IsNotEmpty()
    durationMin: number;
    @IsNotEmpty()
    skipMax: number;
    @IsNotEmpty()
    skipMin: number;
    descType: string;

    mediaType: string;
    sizeType: [];
    formatType: [];
    sizeMax: number;
    
    titleMax: number;
    descriptionMax: number;
    distanceArea: number;
    intervalAds: number;
    conterImpression: number;
    servingMultiplier: number;

    creditValue: number;
    AdsSkip: number;
}