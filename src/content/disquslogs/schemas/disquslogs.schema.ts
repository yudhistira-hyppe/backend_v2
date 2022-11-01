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
  txtMessages: String  
 @Prop()
 postID: String
 @Prop()
 createdAt: String
 @Prop()
 updatedAt: String
 @Prop()
    reactionUri: String
    @Prop()
    receiverActive: boolean
    @Prop()
   senderActive: boolean
   @Prop()
   parentID: String;


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

   @Prop([{ type: Object }])
   replyLogs: [
      {
         $ref: String;
            $id: String;
         $db: String;
      },
   ];
   @Prop([{ type: Object }])
   tags: [
      {
         $ref: String;
            $id: {
               oid: String
            };
         $db: String;
      },
   ];
 @Prop()
 _class:String
}

export const DisquslogsSchema = SchemaFactory.createForClass(Disquslogs);