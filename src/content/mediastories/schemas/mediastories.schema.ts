import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type MediastoriesDocument = Mediastories & Document ;

@Schema()
export class Mediastories {
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
  rotate: Number
 @Prop()
 _class:String
 @Prop()
 apsara: boolean 
 @Prop()
 apsaraId: String    
 @Prop()
 viewers: any[]; 
 @Prop()
    mediaThumb: String
    @Prop()
    uploadSource: String;
    @Prop()
    mediaThumName: String
    @Prop()
    mediaThumBasePath: String
    @Prop()
    mediaThumUri: String
 
}

export const MediastoriesSchema = SchemaFactory.createForClass(Mediastories);