import { IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class AdsObjectivitasDto {
    readonly _id: mongoose.Types.ObjectId;
    @IsNotEmpty()
    name_id: string;
    @IsNotEmpty()
    name_en: string;
    desc_id: string;
    desc_en: string;
    icon: string;
    createdAt: string;
    updatedAt: string;
    percentageMin: number;
    percentageMax: number;
    priority: number;
}