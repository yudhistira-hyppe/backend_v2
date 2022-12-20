import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';

export type GroupDocument = Group & Document;

@Schema({ collection: 'group' })
export class Group {
  _id: ObjectId;
  @Prop()
  userbasics: Array<ObjectId>
  @Prop({ type: mongoose.Types.ObjectId })
  divisionId: mongoose.Types.ObjectId;
  @Prop()
  nameGroup: string
  @Prop()
  createAt: string
  @Prop()
  updateAt: string
  @Prop()
  desc: string
}
export const GroupSchema = SchemaFactory.createForClass(Group);