import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Long } from "mongodb";

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
  @Prop()
  followers: Long;
  @Prop()
  followings: Long;
  @Prop()
  unfollows: Long;
  @Prop()
  likes: Long;
  @Prop()
  views: Long;
  @Prop()
  views_profile: Long;
  @Prop()
  comments: Long;
  @Prop()
  posts: Long;
  @Prop()
  shares: Long;
  @Prop()
  reactions: Long;
 @Prop()
    _class: String
    @Prop()
    insightLogs: [
        {
            $ref: String;
            $id: String;
            $db: String;
        },
    ]
}

export const InsightsSchema = SchemaFactory.createForClass(Insights);