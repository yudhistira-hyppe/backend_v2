import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { type } from 'os';

export type ActivityeventsDocument = Activityevents & Document;

@Schema()
export class Activityevents {
  //   @Prop({ type: mongoose.Schema.Types.ObjectId })
  //   _id: { oid: String };
  @Prop()
  activityEventID: String;
  @Prop()
  activityType: String;
  @Prop()
  active: boolean;
  @Prop()
  status: String;
  @Prop()
  event: String;
  @Prop()
  target: String;
  @Prop({ type: Object })
  payload: {
    login_location: {
      latitude: String;
      longitude: String;
    };
    logout_date: String;
    login_date: String;
    login_device: String;
    email: String;
  };
  @Prop()
  createdAt: String;
  @Prop()
  updatedAt: String;
  @Prop()
  sequenceNumber: String;
  @Prop()
  flowIsDone: boolean;
  @Prop([{ type: Object }])
  transitions: [
    {
      ref: String;
      id: String;
      db: String;
    },
  ];
  @Prop()
  _class: 'io.melody.hyppe.trans.domain.ActivityEvent';
}

export const ActivityeventsSchema =
  SchemaFactory.createForClass(Activityevents);
