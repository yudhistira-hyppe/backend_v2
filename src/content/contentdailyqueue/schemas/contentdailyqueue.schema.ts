import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ContentdailyqueuesDocument = Contentdailyqueues & Document ;

@Schema({collection:'contentdailyqueue'})
export class Contentdailyqueues {
 @Prop()
 _id:String;

  @Prop()
  active: boolean;

  @Prop()
 createdAt: String
 @Prop()
 updatedAt: String
 @Prop()
 aggrYear:Number
 @Prop()
 aggrMonth:Number
 @Prop()
 aggrWeek:Number
 @Prop()
 aggrDay:Number
 @Prop()
 _class:String
}

export const ContentdailyqueuesSchema = SchemaFactory.createForClass(Contentdailyqueues);