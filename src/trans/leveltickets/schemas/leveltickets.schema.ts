import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type LevelticketsDocument = Leveltickets & Document;

@Schema()
export class Leveltickets {

    _id: mongoose.Types.ObjectId;
    @Prop()
    nameLevel: string;
    @Prop()
    descLevel: string;

}

export const LevelticketsSchema = SchemaFactory.createForClass(Leveltickets);