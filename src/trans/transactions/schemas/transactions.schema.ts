import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { VaCallback } from '../dto/create-transactions.dto';

export type TransactionsDocument = Transactions & Document;

@Schema()
export class Transactions {

    _id: mongoose.Types.ObjectId;
    @Prop()
    noinvoice: string
    @Prop()
    postid: string

    @Prop({ type: mongoose.Schema.Types.ObjectId })
    idusersell: { oid: string }
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    iduserbuyer: { oid: string }
    @Prop()
    amount: number
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    paymentmethod: { oid: string }

    @Prop()
    status: string
    @Prop()
    description: string
    @Prop()
    nova: string
    @Prop()
    expiredtimeva: string

    @Prop()
    salelike: boolean
    @Prop()
    saleview: boolean
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    bank: { oid: string }
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    ppn: { oid: string }
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    mdradmin: { oid: string }
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    bankvacharge: { oid: string }
    @Prop()
    totalamount: number
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    accountbalance: { oid: string }
    @Prop()
    timestamp: string
    @Prop()
    payload: VaCallback


}

export const TransactionsSchema = SchemaFactory.createForClass(Transactions);