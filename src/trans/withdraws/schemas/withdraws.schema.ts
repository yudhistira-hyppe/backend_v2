import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type WithdrawsDocument = Withdraws & Document;

@Schema()
export class Withdraws {

    _id: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId })
    idUser: { oid: string }
    @Prop()
    amount: number
    @Prop()
    status: string
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    bankVerificationCharge: { oid: string }
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    bankDisbursmentCharge: { oid: string }
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    accountBalanceid: { oid: string }
    @Prop()
    timestamp: string
    @Prop()
    verified: boolean
    @Prop()
    expired: string
    @Prop()
    description: string
    @Prop()
    statusOtp: string

}

export const WithdrawsSchema = SchemaFactory.createForClass(Withdraws);