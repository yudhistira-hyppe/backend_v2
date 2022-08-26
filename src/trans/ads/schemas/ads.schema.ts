import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { Document } from 'mongoose';

export type AdsDocument = Ads & Document;

@Schema()
export class Ads {
    _id: mongoose.Types.ObjectId;
    @Prop({ type: Object })
    userID: { oid: String; };
    @Prop({ type: Object })
    userIDAssesment: { oid: String; };
    @Prop({ type: Object })
    demografisID: {
        $ref: String;
        $id: { oid: String };
        $db: String;
    };
    // @Prop([])
    // interestID: [];
    @Prop([{ type: Object }])
    interestID: [
        {
            ref: String;
            id: {
                oid: String;
            };
            db: String;
        },
    ];
    @Prop({ type: Object })
    typeAdsID: { oid: String; };
    @Prop({ type: Object })
    placingID: { oid: String; };
    @Prop()
    description: string;
    @Prop()
    expiredAt: string;
    @Prop()
    gender: string;
    @Prop()
    liveAt: string;
    @Prop()
    name: string;
    @Prop()
    objectifitas: string;
    @Prop()
    status: string;
    @Prop()
    timestamp: string;
    @Prop()
    totalClick: number;
    @Prop()
    totalUsedCredit: number;
    @Prop()
    totalView: number;
    @Prop()
    urlLink: string;
    @Prop([])
    userVoucherID: [];
    @Prop()
    isActive: boolean;
    @Prop()
    type: string;
    @Prop({ type: Object })
    mediaAds: { oid: String; };
    @Prop()
    tayang: number;
    @Prop()
    endAge: number;
    @Prop()
    startAge: number;
    @Prop()
    usedCredit: number;
    @Prop()
    usedCreditFree: number;
    @Prop()
    creditFree: number;
    @Prop()
    creditValue: number;
    @Prop()
    totalCredit: number;
    @Prop()
    liveTypeAds: boolean;
}

export const AdsSchema = SchemaFactory.createForClass(Ads);