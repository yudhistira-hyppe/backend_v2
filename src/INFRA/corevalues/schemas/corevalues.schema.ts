import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type CorevaluesDocument = Corevalues & Document ;

@Schema()
export class Corevalues {
 @Prop({type: mongoose.Schema.Types.ObjectId})
 _id: { oid:String  }

  @Prop()
  event: string;

  @Prop()
  json_schema: String
  @Prop()
  category: String

  @Prop()
  activityType: String
 
}

export const CorevaluesSchema = SchemaFactory.createForClass(Corevalues);