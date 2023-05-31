import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AdstypeDocument = Adstype & Document;

@Schema({ collection: 'adstypes' })
export class Adstype {
    _id: mongoose.Types.ObjectId;
    @Prop()
    nameType: string;
    @Prop()
    creditValue: number;
    @Prop()
    mediaType: string;
    @Prop([])
    sizeType: [];
    @Prop([])
    formatType: [];
    @Prop()
    descType: string;
    @Prop()
    AdsSkip: number;
    @Prop()
    rewards: number;
    @Prop()
    conterImpression: number;
    @Prop()
    descriptionMax: number;
    @Prop()
    durationMax: number;
    @Prop()
    durationMin: number;
    @Prop()
    sizeMax: number;
    @Prop()
    titleMax: number;
    @Prop()
    distanceArea: number;
    @Prop()
    intervalAds: number;
    @Prop()
    servingMultiplier: number;
}
export const AdstypeSchema = SchemaFactory.createForClass(Adstype);