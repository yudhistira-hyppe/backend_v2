import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

export type MediastikerDocument = Mediastiker & Document;

@Schema({ collection: 'mediaStiker' })
export class Mediastiker {
    _id: mongoose.Types.ObjectId;
    @Prop()
    name: string;
    @Prop()
    kategori: string;
    @Prop()
    image: string;
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
    @Prop()
    used: number;
    @Prop()
    status: boolean;
    @Prop()
    isDelete: boolean;
}
export const MediastikerSchema = SchemaFactory.createForClass(Mediastiker)