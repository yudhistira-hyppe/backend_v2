import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ThemeDocument = Theme & Document ;

@Schema({ collection: 'theme' })
export class Theme {
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

export const ThemeSchema = SchemaFactory.createForClass(Theme);