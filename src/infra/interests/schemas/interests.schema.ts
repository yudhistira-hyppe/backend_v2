import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type InterestsDocument = Interests & Document ;

@Schema()
export class Interests {
 @Prop({type: mongoose.Schema.Types.ObjectId})
 _id: { oid:String  }

  @Prop()
  interestName: string;

  @Prop()
  langIso: String
  @Prop()
  icon: String

  @Prop()
 createdAt: String
 @Prop()
 updatedAt: String
 @Prop()
 _class:String
}

export const InterestsSchema = SchemaFactory.createForClass(Interests);