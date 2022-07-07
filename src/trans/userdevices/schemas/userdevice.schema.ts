import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserdeviceDocument = Userdevice & Document ;

@Schema()
export class Userdevice {
  @Prop()
  _id: string;
  @Prop()
  deviceID: string;
  @Prop()
  email: String;
  @Prop()
  active: boolean;
  @Prop()
  createdAt: String;
  @Prop()
  updatedAt: String;
  @Prop()
  _class: String;
  @Prop()
  webdeviceID: String;
  @Prop()
  devicetype: String;
}

export const UserdeviceSchema = SchemaFactory.createForClass(Userdevice);