import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ReportreasonsDocument = Reportreasons & Document;

@Schema()
export class Reportreasons {

    _id: mongoose.Types.ObjectId;
    @Prop()
    reason: string;
    @Prop()
    reasonEn: string;
    @Prop()
    class: string;
    @Prop()
    description: string;
    @Prop()
    language: string;
    @Prop()
    type: string;

}

export const ReportreasonsSchema = SchemaFactory.createForClass(Reportreasons);