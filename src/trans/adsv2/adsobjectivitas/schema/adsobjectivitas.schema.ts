import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AdsObjectivitasDocument = AdsObjectivitas & Document;

@Schema()
export class AdsObjectivitas {
    _id: mongoose.Types.ObjectId;
    @Prop()
    name_id: string;
    @Prop()
    name_en: string;
    @Prop()
    desc_id: string;
    @Prop()
    desc_en: string;
    @Prop()
    icon: string
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
}
export const AdsObjectivitasSchema = SchemaFactory.createForClass(AdsObjectivitas);