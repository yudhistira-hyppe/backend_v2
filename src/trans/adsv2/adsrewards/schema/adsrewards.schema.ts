import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { Document } from 'mongoose';

export type AdsRewardsDocument = AdsRewards & Document;

@Schema()
export class AdsRewards {
    _id: mongoose.Types.ObjectId;
    @Prop({ type: Object })
    iduser: mongoose.Types.ObjectId;
    @Prop({ type: Object })
    idAdsType: mongoose.Types.ObjectId;
    @Prop()
    nameType: string;
    @Prop() 
    rewardPrice: number;
    @Prop()
    remark: number;
    @Prop()
    status: boolean;
    @Prop()
    createAt: string;
    @Prop()
    updateAt: string;
}
export const AdsRewardsSchema = SchemaFactory.createForClass(AdsRewards);