import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AdstypesDocument = Adstypes & Document;

@Schema()
export class Adstypes {
    _id: mongoose.Types.ObjectId;
    @Prop()
    nameType: string;
    @Prop()
    rewards: number;
    @Prop()
    durationMax: number;
    @Prop()
    durationMin: number;
    @Prop()
    descType: string;

    @Prop()
    CPV: number;
    @Prop()
    CPA: number;
    @Prop()
    skipMax: number;
    @Prop()
    skipMin: number;

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
    conterImpression: number;
    @Prop()
    servingMultiplier: number;

    @Prop()
    creditValue: number;
    @Prop()
    AdsSkip: number;

}

export const AdstypesSchema = SchemaFactory.createForClass(Adstypes);