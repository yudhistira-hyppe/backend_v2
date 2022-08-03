import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';

export type ModuleDocument = Module & Document;

@Schema({ collection: 'module' })
export class Module {
  _id: ObjectId;
  @Prop()
  nameModule: string
  @Prop()
  createAt: string
  @Prop()
  updateAt: string
  @Prop() 
  desc: string
}
export const ModuleSchema = SchemaFactory.createForClass(Module);