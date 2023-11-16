import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type newUserDevicesDocument = newUserDevices & Document ;

@Schema({ collection:"newUserDevices" })
export class newUserDevices {
  @Prop()
  _id: string;
  @Prop()
  deviceID: string;
  @Prop()
  email: String;
  @Prop()
  idEmail: mongoose.Types.ObjectId;
  @Prop([{ type: Object }])
  user: any[];
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

export const newUserdeviceSchema = SchemaFactory.createForClass(newUserDevices);