import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Long } from "mongodb";

export type TopupsDocument = Topups & Document ;

@Schema({ collection: 'topups' })
export class Topups {
  @Prop({ type: mongoose.Types.ObjectId })
  _id: mongoose.Types.ObjectId
  @Prop({ type: mongoose.Types.ObjectId })
  idUser: mongoose.Types.ObjectId
  @Prop()
  email: string
  @Prop()
  username: String
  @Prop()
  topup: number
  @Prop()
  pph: number
  @Prop()
  npwp: String
  @Prop()
  pphPersen: number
  @Prop()
  total: number
  @Prop()
  approveByFinance: boolean
  @Prop()
  approveByFinanceDate: String
  @Prop({ type: mongoose.Types.ObjectId })
  approveByFinanceUserId: mongoose.Types.ObjectId
  @Prop()
  approveByStrategy: boolean
  @Prop()
  approveByStrategyDate: String
  @Prop({ type: mongoose.Types.ObjectId })
  approveByStrategyUserId: mongoose.Types.ObjectId
  @Prop()
  approve: boolean
  @Prop()
  status: String
  @Prop({ type: mongoose.Types.ObjectId })
  createBy: mongoose.Types.ObjectId
  @Prop()
  createByUsername: String
  @Prop()
  createdAt: String
  @Prop()
  updatedAt: String
  @Prop()
  remact: String
}

export const TopupsSchema = SchemaFactory.createForClass(Topups);