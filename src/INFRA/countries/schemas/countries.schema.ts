import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type CountriesDocument = Countries & Document ;

@Schema()
export class Countries {
 @Prop({type: mongoose.Schema.Types.ObjectId})
 _id: { oid:String  }

  @Prop()
  country: string;

  @Prop()
  countryCode: String
  @Prop()
  countryID: String
  @Prop()
  isoCode: String
  @Prop()
 createdAt: String
 @Prop()
 updatedAt: String
 @Prop()
 _class:String
}

export const CountriesSchema = SchemaFactory.createForClass(Countries);