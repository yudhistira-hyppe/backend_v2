import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type SourceticketsDocument = Sourcetickets & Document;

@Schema()
export class Sourcetickets {

    _id: mongoose.Types.ObjectId;
    @Prop()
    sourceName: string;
    @Prop()
    desc: string;

}

export const SourceticketsSchema = SchemaFactory.createForClass(Sourcetickets);