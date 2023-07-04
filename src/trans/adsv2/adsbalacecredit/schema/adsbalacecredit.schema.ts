import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AdsBalaceCreditDocument = AdsBalaceCredit & Document;

@Schema()
export class AdsBalaceCredit {
    _id: mongoose.Types.ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    iduser: mongoose.Types.ObjectId;
    @Prop()
    debet: number
    @Prop()
    kredit: number
    @Prop()
    type: string
    @Prop()
    timestamp: string
    @Prop()
    description: string
    @Prop()
    idtrans: mongoose.Types.ObjectId;
}

export const AdsBalaceCreditSchema = SchemaFactory.createForClass(AdsBalaceCredit);