import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AdsplacesDocument = Adsplaces & Document;

@Schema()
export class Adsplaces {
    _id: mongoose.Types.ObjectId;
    @Prop()
    namePlace: string

    @Prop()
    descPlace: String

    @Prop({ type: Object })
    adsType: { oid: String; }
}

export const AdsplacesSchema = SchemaFactory.createForClass(Adsplaces);