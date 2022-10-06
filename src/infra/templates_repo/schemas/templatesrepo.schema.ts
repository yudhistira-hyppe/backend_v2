import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type TemplatesRepoDocument = TemplatesRepo & Document ;

@Schema({collection:'templates_repo'})
export class TemplatesRepo {
 @Prop({type: mongoose.Schema.Types.ObjectId})
 _id: { oid:String  }

  @Prop()
  name: string;

  @Prop()
  event: String
 
  @Prop()
  subject: String
  @Prop()
  from: String
  @Prop()
  body_detail: String
  @Prop()
  status: String
  @Prop()
  type: String
 @Prop()
 langIso: String
 @Prop()
 category:String
 @Prop()
 body_detail_id: String 
}

export const TemplatesRepoSchema = SchemaFactory.createForClass(TemplatesRepo);