import { IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class AdsPurposesDto {
    readonly _id: mongoose.Types.ObjectId;
    @IsNotEmpty()
    namePurposes_id: string;
    @IsNotEmpty()
    namePurposes_en: string;
    descPPurposes_id: string;
    descPPurposes_en: string;
    iconPurposes: string;
    createdAt: string;
    updatedAt: string;
}