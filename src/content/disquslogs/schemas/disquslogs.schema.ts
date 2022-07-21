import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type DisquslogsDocument = Disquslogs & Document ;

@Schema()
export class Disquslogs {
 @Prop()
 _id:String;

  @Prop()
  disqusID: String
  @Prop()
  sequenceNumber: Number
  @Prop()
  sender: String
  @Prop()
  receiver: String
  @Prop()
  active: boolean
  @Prop()
  eventInsight: String
  @Prop()
  postType: String
 @Prop()
 postID: String
 @Prop()
 createdAt: String
 @Prop()
 updatedAt: String
 @Prop()
    reactionUri: String
    @Prop()
    emailActive: boolean
    @Prop()
    mateActive: boolean


 @Prop([{type:Object}])
 medias: [{
    createdAt: String
    mediaBasePath: String
    postType: String
    mediaUri: String
    description: String
    active: boolean
    mediaType: String
    postID: String
    mediaEndpoint: String
}]
@Prop()
replyLogs:[]
 @Prop()
 _class:String
}

export const DisquslogsSchema = SchemaFactory.createForClass(Disquslogs);