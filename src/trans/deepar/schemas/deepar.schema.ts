import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type DeepArDocument = DeepAr & Document;

@Schema({ collection: 'deepar' })
export class DeepAr {
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    _id: { oid: String }
    @Prop()
    device: [string]
}
export const DeepArSchema = SchemaFactory.createForClass(DeepAr);