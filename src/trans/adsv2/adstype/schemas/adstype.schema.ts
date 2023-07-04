import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AdsTypeDocument = AdsType & Document;

@Schema({ collection: 'adstypes' })
export class AdsType {
    _id: mongoose.Types.ObjectId;
    @Prop()
    nameType: string;
    @Prop()
    CPV: number;
    @Prop()
    CPA: number;
    @Prop()
    rewards: number;
    @Prop()
    durationMax: number;
    @Prop()
    durationMin: number;
    @Prop()
    skipMax: number;
    @Prop()
    skipMin: number;
    @Prop()
    descType: string;


    @Prop()
    mediaType: string;
    @Prop([])
    sizeType: [];
    @Prop([])
    formatType: [];
    @Prop()
    sizeMax: number;

    @Prop()
    titleMax: number;
    @Prop()
    descriptionMax: number;
    @Prop()
    distanceArea: number;
    @Prop()
    intervalAds: number;
    @Prop()
    servingMultiplier: number;
    @Prop()
    conterImpression: number;
}
export const AdsTypeSchema = SchemaFactory.createForClass(AdsType);