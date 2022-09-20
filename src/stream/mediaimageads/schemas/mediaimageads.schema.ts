import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type MediaimageadsDocument = Mediaimageads & Document;

@Schema()
export class Mediaimageads {
    _id: mongoose.Types.ObjectId;
    @Prop()
    active: boolean;
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
    @Prop()
    mediaMime: string;
    @Prop()
    mediaType: string;
    @Prop()
    originalName: string;
    @Prop()
    imageId: string;
}

export const MediaimageadsSchema = SchemaFactory.createForClass(Mediaimageads);