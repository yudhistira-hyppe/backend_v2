import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type MethodepaymentsDocument = Methodepayments & Document;

@Schema()
export class Methodepayments {
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    _id: { oid: String }
    @Prop()
    methodename: string



}

export const MethodepaymentsSchema = SchemaFactory.createForClass(Methodepayments);