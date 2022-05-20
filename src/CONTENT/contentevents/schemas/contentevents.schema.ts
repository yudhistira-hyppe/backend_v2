import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ContenteventsDocument = Contentevents & Document ;

@Schema()
export class Contentevents {
 @Prop()
 _id:String;

  @Prop()
  contentEventID: String
  @Prop()
  email: String
  @Prop()
  eventType: String
  @Prop()
  active: boolean
  @Prop()
  event: String
  @Prop()
 createdAt: String
 @Prop()
 updatedAt: String
 @Prop()
 sequenceNumber:Number
 @Prop()
 flowIsDone: boolean
 @Prop()
 _class:String
}

export const ContenteventsSchema = SchemaFactory.createForClass(Contentevents);