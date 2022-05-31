import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type MediapictsDocument = Mediapicts & Document ;

@Schema()
export class Mediapicts {
 @Prop()
 _id:String;
  @Prop()
  mediaID: String
  @Prop()
  postID: String
  @Prop()
  active: boolean
  @Prop()
 createdAt: String
 @Prop()
 updatedAt: String
  @Prop()
  mediaType: String
  @Prop()
  mediaBasePath: String
  @Prop()
  mediaUri: String
  @Prop()
  originalName: String
  @Prop()
  fsSourceUri: String
  @Prop()
  fsSourceName: String
  @Prop()
  fsTargetUri: String
  @Prop()
  mediaMime: String
 @Prop()
 _class:String
}

export const MediapictsSchema = SchemaFactory.createForClass(Mediapicts);