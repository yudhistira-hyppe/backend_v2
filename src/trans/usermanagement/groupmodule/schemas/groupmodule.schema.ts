import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';

export type GroupModuleDocument = GroupModule & Document;

@Schema({ collection: 'groupmodule' })
export class GroupModule {
  _id: ObjectId;
  @Prop({ type: Object })
  group: mongoose.Types.ObjectId;
  @Prop({ type: Object })
  module: mongoose.Types.ObjectId;
  @Prop()
  createAcces: boolean;
  @Prop()
  updateAcces: boolean;
  @Prop()
  deleteAcces: boolean;
  @Prop()
  viewAcces: boolean;
  @Prop()
  createAt: string;
  @Prop()
  updateAt: string;
  @Prop() 
  desc: string;
}
export const GroupModuleSchema = SchemaFactory.createForClass(GroupModule);