import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { type } from 'os';
import { Int32 } from "mongodb";

export type ActivityeventsDocument = Activityevents & Document;

@Schema()
export class Activityevents {
  // @Prop({ type: Object })
  _id: mongoose.Types.ObjectId;
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
  sequenceNumber: Int32;
  @Prop()
  parentActivityEventID: String;
  @Prop()
  flowIsDone: boolean;
  @Prop([{ type: Object }])
  transitions: [
    {
      $ref: String;
      $id: {
        oid: String;
      };
      $db: String;
    },
  ];
  @Prop()
  _class: String;
  @Prop()
  action: String;
  @Prop()
  fork: String;
  @Prop({ type: Object })
  userbasic: {
    oid: String;
  };
}

export const ActivityeventsSchema = SchemaFactory.createForClass(Activityevents);
