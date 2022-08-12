import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';

export type DivisionDocument = Division & Document;

@Schema({ collection: 'division' })
export class Division {
  _id: ObjectId;
  @Prop()
  nameDivision: string
  @Prop()
  createAt: string
  @Prop()
  updateAt: string
  @Prop()
  desc: string
}

export const DivisionSchema = SchemaFactory.createForClass(Division);