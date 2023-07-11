import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { Document } from 'mongoose';

export type AdsLogsDocument = AdsLogs & Document;

@Schema()
export class AdsLogs {
    _id: mongoose.Types.ObjectId;
    @Prop({ type: Object })
    iduser: mongoose.Types.ObjectId;
    @Prop()
    nameActivitas: string[];
    @Prop()
    desc: string;
    @Prop()
    type: string;
    @Prop()
    dateTime: string;
    @Prop()
    request: string;
    @Prop()
    response: string;
    
}
export const AdsLogsSchema = SchemaFactory.createForClass(AdsLogs);