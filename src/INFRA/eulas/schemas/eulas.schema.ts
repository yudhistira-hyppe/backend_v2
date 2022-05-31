import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type EulasDocument = Eulas & Document ;

@Schema()
export class Eulas {
 @Prop({type: mongoose.Schema.Types.ObjectId})
 _id: { oid:String  }

  @Prop()
  eulaID: string;

  @Prop()
  eulaContent: String
  @Prop()
  version: String
  @Prop()
  langIso: String
  @Prop()
 createdAt: String
 @Prop()
 updatedAt: String
 @Prop()
 _class:String
}

export const EulasSchema = SchemaFactory.createForClass(Eulas);