import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type VouchersDocument = Vouchers & Document;

@Schema()
export class Vouchers {
    //  @Prop({type: mongoose.Schema.Types.ObjectId})
    // _id: { oid:string  }
    _id: mongoose.Types.ObjectId;
    @Prop()
    noVoucher: string;
    @Prop()
    codeVoucher: string;
    @Prop({ type: Object })
    userID: { oid: String; };
    @Prop()
    nameAds: string;
    @Prop()
    creditValue: number;
    @Prop()
    creditPromo: number;
    @Prop()
    creditTotal: number;
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
    @Prop()
    expiredAt: string;
    @Prop()
    amount: number;
    @Prop()
    totalUsed: number;
    @Prop()
    isActive: boolean;
    @Prop()
    description: string;

}

export const VouchersSchema = SchemaFactory.createForClass(Vouchers);