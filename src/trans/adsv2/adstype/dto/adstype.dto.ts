import mongoose from "mongoose";

export class AdsTypeDto {
    readonly _id: mongoose.Types.ObjectId;
    nameType: string;
    creditValue: number;
    mediaType: string;
    sizeType: [];
    formatType: [];
    descType: string;
    rewards: number;
    AdsSkip: number;
    conterImpression: number;
    descriptionMax: number;
    durationMax: number;
    durationMin: number;
    sizeMax: number;
    titleMax: number;
    distanceArea: number;
    intervalAds: number;
    servingMultiplier: number;
}