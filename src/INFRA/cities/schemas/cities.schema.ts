import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type CitiesDocument = Cities & Document ;

@Schema()
export class Cities {
 @Prop({type: mongoose.Schema.Types.ObjectId})
 _id: { oid:String  }

  @Prop()
  stateID: string;

  @Prop()
  cityName: String
  @Prop()
  cityID: String

  @Prop()
 createdAt: String
 @Prop()
 updatedAt: String
 @Prop()
 _class:String
}

export const CitiesSchema = SchemaFactory.createForClass(Cities);