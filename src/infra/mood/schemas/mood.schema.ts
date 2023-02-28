import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type MoodDocument = Mood & Document ;

@Schema({ collection: 'mood' })
export class Mood {
    _id: mongoose.Types.ObjectId;
    @Prop()
    name: String;
    @Prop()
    name_id: String;
    @Prop()
    langIso: String;
    @Prop()
    icon: String;
    @Prop()
    createdAt: String
    @Prop()
    updatedAt: String
}

export const MoodSchema = SchemaFactory.createForClass(Mood);