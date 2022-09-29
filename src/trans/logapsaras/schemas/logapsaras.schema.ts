import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type LogapsarasDocument = Logapsaras & Document;

@Schema()
export class Logapsaras {
    _id: mongoose.Types.ObjectId;
    @Prop([])
    idapsara: any[];
    @Prop({ type: Object })
    idMedia: { oid: String; };
    @Prop()
    timestamp: string;
    @Prop()
    type: string;



}

export const LogapsarasSchema = SchemaFactory.createForClass(Logapsaras);