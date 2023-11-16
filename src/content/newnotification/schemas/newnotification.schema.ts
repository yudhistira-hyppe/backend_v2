import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type NewNotificationsDocument = newnotification & Document;

@Schema({ collection:"newNotifications" })
export class newnotification {
  @Prop()
  _id: String;
  @Prop()
  notificationID: String
  @Prop()
  email: String
  @Prop()
  eventType: String
  @Prop()
  event: String
  @Prop()
  mate: String
  @Prop({ type: Object })
  senderOrReceiverInfo: {
    fullName: String
    avatar: {
      mediaBasePath: String
      mediaUri: String
      mediaType: String
      mediaEndpoint: String
    };
    username: String
  }
  @Prop()
  title: String
  @Prop()
  body: String
  @Prop()
  bodyId: String
  @Prop()
  active: boolean
  @Prop()
  flowIsDone: boolean
  @Prop()
  createdAt: String
  @Prop()
  updatedAt: String
  @Prop()
  contentEventID: String
  @Prop()
  postID: String
  @Prop()
  postType: String
  @Prop([])
  devices: any[]
  @Prop()
  actionButtons: String
  @Prop()
  deviceType: String
  @Prop()
  _class: String
  @Prop({ type: Object })
  user: {
    _id: mongoose.Types.ObjectId
    idEmail: mongoose.Types.ObjectId
    email: String
    emailEvent: String
  }
  @Prop()
  templateID: mongoose.Types.ObjectId;
  @Prop()
  idEmail: mongoose.Types.ObjectId;
  @Prop([])
  statusDevices: any[]
  @Prop()
  sendNotifChallenge: string
}

export const NewNotificationsSchema = SchemaFactory.createForClass(newnotification);