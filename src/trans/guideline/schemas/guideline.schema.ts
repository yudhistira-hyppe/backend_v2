import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type GuidelineDocument = Guideline & Document;

@Schema({ collection: 'guidelines' })
export class Guideline {
    @Prop()
    _id: mongoose.Schema.Types.ObjectId;

    @Prop()
    name: String;
    @Prop()
    title_id: String;
    @Prop()
    title_en: String;
    @Prop()
    value_id: String;
    @Prop()
    value_en: String;
    @Prop()
    remark: String;
    @Prop()
    createdAt: String;
    @Prop()
    updatedAt: String;
    @Prop()
    approvedAt: String;
    @Prop()
    isActive: boolean;
    @Prop()
    status: String;
    @Prop()
    createdBy: mongoose.Schema.Types.ObjectId;
    @Prop()
    updatedBy: mongoose.Schema.Types.ObjectId;
    @Prop()
    approvedBy: mongoose.Schema.Types.ObjectId;
    @Prop()
    isDeleted: boolean
}

export const GuidelineSchema = SchemaFactory.createForClass(Guideline);