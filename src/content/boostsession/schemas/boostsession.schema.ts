import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type BoostsessionDocument = Boostsession & Document ;

@Schema({ collection: 'boostSession' })
export class Boostsession {
    @Prop()
    _id: mongoose.Types.ObjectId;
    @Prop()
    name: String;
    @Prop()
    start: String;
    @Prop()
    end: String;
    @Prop()
    type: String;
    @Prop()
    langIso: String;
}
export const BoostsessionSchema = SchemaFactory.createForClass(Boostsession);