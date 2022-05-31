import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type LanguagesDocument = Languages & Document ;

@Schema()
export class Languages {
 @Prop({type: mongoose.Schema.Types.ObjectId})
 _id: { oid:String  }

  @Prop()
  langID: string;

  @Prop()
  lang: String
  @Prop()
  langIso: String

  @Prop()
 createdAt: String
 @Prop()
 updatedAt: String
 @Prop()
 _class:String
}

export const LanguagesSchema = SchemaFactory.createForClass(Languages);