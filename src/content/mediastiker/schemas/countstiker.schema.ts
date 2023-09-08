import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

export type CountstikerDocument = Countstiker & Document;

@Schema({ collection: 'countStiker' })
export class Countstiker {
    _id: mongoose.Types.ObjectId;
    @Prop()
    stikerId: mongoose.Types.ObjectId;
    @Prop()
    name: string;
    @Prop()
    image: string;
    @Prop()
    countused: number;
    @Prop()
    countsearch: number;
    @Prop()
    createdAt: string;
}
export const CountstikerSchema = SchemaFactory.createForClass(Countstiker)