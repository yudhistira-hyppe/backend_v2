import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type MediaproofpictsDocument = Mediaproofpicts & Document ;

@Schema()
export class Mediaproofpicts {
 @Prop()
 _id:String;
  @Prop()
  mediaID: String
  @Prop()
  active: boolean
  @Prop()
  valid: boolean
  @Prop()
 createdAt: String
 @Prop()
 updatedAt: String
 @Prop()
 postType: String
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

export const MediaproofpictsSchema = SchemaFactory.createForClass(Mediaproofpicts);