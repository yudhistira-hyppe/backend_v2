import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type MediavideosDocument = Mediavideos & Document ;

@Schema()
export class Mediavideos {
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
  mediaThumb: String
  @Prop()
  originalName: String
  @Prop()
  fsSourceUri: String
  @Prop()
  fsSourceName: String
  @Prop()
  fsTargetUri: String
  @Prop()
  fsTargetThumbUri: String
  @Prop()
  mediaMime: String
  @Prop()
  rotate: Number
  @Prop()
  _class:String
  @Prop()
  apsara: boolean 
  @Prop()
  apsaraId: String   
}

export const MediavideosSchema = SchemaFactory.createForClass(Mediavideos);