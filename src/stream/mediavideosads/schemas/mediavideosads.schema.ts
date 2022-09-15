import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type MediavideosadsDocument = Mediavideosads & Document;

@Schema()
export class Mediavideosads {
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
    rotate: number;
    @Prop()
    videoId: string;
    @Prop()
    duration: number;
}

export const MediavideosadsSchema = SchemaFactory.createForClass(Mediavideosads);