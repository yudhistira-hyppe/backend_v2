import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Double } from 'mongodb';
import mongoose, { Document } from 'mongoose';

export type UserAdsDocument = UserAds & Document;

@Schema()
export class UserAds {
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    _id: mongoose.Types.ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    adsID: mongoose.Types.ObjectId;
    @Prop()
    clickAt: String;
    @Prop()
    createdAt: String;
    @Prop()
    description: String;
    @Prop()
    priority: String;
    @Prop()
    priorityNumber: number;
    @Prop()
    statusClick: boolean;
    @Prop()
    statusView: boolean;
    @Prop()
    updatedAt: String;
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    userID: mongoose.Types.ObjectId;
    @Prop()
    viewAt: String;
    @Prop()
    liveAt: String;
    @Prop()
    viewed: number;
    @Prop()
    viewedUnder: number;
    @Prop()
    liveTypeuserads: boolean;
    @Prop()
    adstypesId: mongoose.Types.ObjectId;
    @Prop()
    nameType: string;
    @Prop()
    timeViewSecond: number;
    @Prop()
    isActive: boolean;
    @Prop()
    updateAt: String[];
    @Prop()
    clickTime: String[];
    @Prop()
    scoreAge: number;
    @Prop()
    scoreGender: number;
    @Prop()
    scoreInterest: number;
    @Prop()
    scoreGeografis: number;
    @Prop()
    scoreTotal: number;
}
export const UserAdsSchema = SchemaFactory.createForClass(UserAds);