import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type InsightlogsDocument = Insightlogs & Document ;

@Schema()
export class Insightlogs {
 @Prop()
 _id:String;
  @Prop()
  insightID: String
  @Prop()
  active: boolean
  @Prop()
 createdAt: String
 @Prop()
 updatedAt: String
  @Prop()
  mate: String
  @Prop()
  postID: String
  @Prop()
  eventInsight: String
 @Prop()
 _class:String
}

export const InsightlogsSchema = SchemaFactory.createForClass(Insightlogs);