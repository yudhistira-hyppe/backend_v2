import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type LogapsarasDocument = Logapsaras & Document;

@Schema()
export class Logapsaras {
    _id: mongoose.Types.ObjectId;
    @Prop([])
    idapsara: any[]

    @Prop()
    idMedia: string

    @Prop()
    bankIcon: string
    @Prop()
    urlEbanking: string
    @Prop()
    atm: string
    @Prop()
    internetBanking: string
    @Prop()
    mobileBanking: string




}

export const LogapsarasSchema = SchemaFactory.createForClass(Logapsaras);