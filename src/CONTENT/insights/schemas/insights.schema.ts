import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type InsightsDocument = Insights & Document ;

@Schema()
export class Insights {
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
  email: String
  @Prop({type:Object})
  followers: {
    numberLong:String
  }
  @Prop({type:Object})
  followings: {
    numberLong:String
  }
  @Prop({type:Object})
  unfollows: {
    numberLong:String
  }
  @Prop({type:Object})
  likes: {
    numberLong:String
  }
  @Prop({type:Object})
  views: {
    numberLong:String
  }
  @Prop({type:Object})
  comments: {
    numberLong:String
  }
  @Prop({type:Object})
  posts: {
    numberLong:String
  }
  @Prop({type:Object})
  shares: {
    numberLong:String
  }
  @Prop({type:Object})
  reactions: {
    numberLong:String
  }
 @Prop()
 _class:String
}

export const InsightsSchema = SchemaFactory.createForClass(Insights);