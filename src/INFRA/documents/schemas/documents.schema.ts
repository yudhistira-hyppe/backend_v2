import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type DocumentsDocument = Documents & Document ;

@Schema()
export class Documents {
 @Prop({type: mongoose.Schema.Types.ObjectId})
 _id: { oid:String  }

  @Prop()
  documentId: string;

  @Prop()
  documentName: String
  @Prop()
  countryCode: String
  @Prop()
  langIso: String
  @Prop()
 createdAt: String
 @Prop()
 updatedAt: String
 @Prop()
 _class:String
}

export const DocumentsSchema = SchemaFactory.createForClass(Documents);