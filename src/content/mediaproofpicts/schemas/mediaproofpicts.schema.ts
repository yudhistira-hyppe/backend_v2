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
@Prop() nama: String
@Prop() tempatLahir: String
@Prop() jenisKelamin: String
@Prop() alamat: String
@Prop() agama: String
@Prop() statusPerkawinan: String
@Prop() pekerjaan: String
@Prop() kewarganegaraan: String
@Prop() mediaSelfieType: String
@Prop() mediaSelfieBasePath: String
@Prop() mediaSelfieUri: String
@Prop() SelfieOriginalName: String
@Prop() SelfiefsSourceUri: String
@Prop() SelfiefsSourceName: String
@Prop() SelfiefsTargetUri: String
@Prop() SelfiemediaMime: String;
  @Prop() mediaFileSuportType: String;
  @Prop() mediaFileSuportBasePath: String;
  @Prop() mediaFileSuportUri: String;
  @Prop() FileSuportOriginalName: String;
  @Prop() FileSuportfsSourceUri: String;
  @Prop() FileSuportfsSourceName: String;
  @Prop() FileSuportfsTargetUri: String;
  @Prop() FileSuportmediaMime: String;
  @Prop() status: String;
  @Prop() description: String;
 @Prop()
 _class:String
}

export const MediaproofpictsSchema = SchemaFactory.createForClass(Mediaproofpicts);