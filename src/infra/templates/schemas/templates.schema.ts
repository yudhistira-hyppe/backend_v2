import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type TemplatesDocument = Templates & Document;

@Schema()
export class Templates {
  _id: mongoose.Types.ObjectId;

  @Prop()
  name: string;

  @Prop()
  event: String

  @Prop()
  subject: String
  @Prop()
  from: String
  @Prop()
  body_detail: String
  @Prop()
  body_detail_id: String
  @Prop()
  status: String
  @Prop()
  type: String
  @Prop()
  langIso: String
  @Prop()
  category: String
  @Prop()
  action_buttons: String
  @Prop()
  subject_id: String
  @Prop()
  email: string
  @Prop()
  createdAt: string
  @Prop()
  type_sending: string;
  @Prop()
  active: boolean;
}

export const TemplatesSchema = SchemaFactory.createForClass(Templates);