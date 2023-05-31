import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AdsPurposesDocument = AdsPurposes & Document;

@Schema()
export class AdsPurposes {
    _id: mongoose.Types.ObjectId;
    @Prop()
    namePurposes_id: string;
    @Prop()
    namePurposes_en: string;
    @Prop()
    descPPurposes_id: string;
    @Prop()
    descPPurposes_en: string;
    @Prop()
    iconPurposes: string
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
}

export const AdsPurposesSchema = SchemaFactory.createForClass(AdsPurposes);