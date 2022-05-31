import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AreasDocument = Areas & Document ;

@Schema()
export class Areas {
 @Prop({type: mongoose.Schema.Types.ObjectId})
 _id: { oid:String  }

  @Prop()
  countryID: string;

  @Prop()
  stateName: String
  @Prop()
  stateID: String

  @Prop()
 createdAt: String
 @Prop()
 updatedAt: String
 @Prop()
 _class:String
}

export const AreasSchema = SchemaFactory.createForClass(Areas);