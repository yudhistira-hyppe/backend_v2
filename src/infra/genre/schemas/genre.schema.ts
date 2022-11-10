import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type GenreDocument = Genre & Document ;

@Schema({ collection: 'genre' })
export class Genre {
    _id: mongoose.Types.ObjectId;
    @Prop()
    name: String;
    @Prop()
    langIso: String;
    @Prop()
    icon: String;
    @Prop()
    createdAt: String
    @Prop()
    updatedAt: String
}

export const GenreSchema = SchemaFactory.createForClass(Genre);