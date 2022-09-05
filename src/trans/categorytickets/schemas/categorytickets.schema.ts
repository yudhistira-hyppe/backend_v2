import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type CategoryticketsDocument = Categorytickets & Document;

@Schema()
export class Categorytickets {

    _id: mongoose.Types.ObjectId;
    @Prop()
    nameLevel: string;
    @Prop()
    descLevel: string;

}

export const CategoryticketsSchema = SchemaFactory.createForClass(Categorytickets);