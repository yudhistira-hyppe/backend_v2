import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type Pph21sDocument = Pph21s & Document;

@Schema()
export class Pph21s {
  _id: mongoose.Types.ObjectId;

  // @Prop({ type: mongoose.Schema.Types.ObjectId })
  // settingId: { oid: string }
  // @Prop({ type: mongoose.Schema.Types.ObjectId })
  // transactionId: { oid: string }
  @Prop()
  transactionId: mongoose.Schema.Types.ObjectId

  @Prop()
  income: number
  @Prop()
  totalincome: number
  @Prop()
  Year: number
  @Prop()
  TimeStamp: string
  @Prop()
  Desc: string
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  userid: { oid: string }

}

export const Pph21sSchema = SchemaFactory.createForClass(Pph21s);