import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type DomaineventsDocument = Domainevents & Document ;

@Schema()
export class Domainevents {
   @Prop({type: mongoose.Schema.Types.ObjectId})
  _id: { oid:String  }
  @Prop()
  aggregateIdentifier: String
  @Prop()
  type: String

@Prop({type:Object})
sequenceNumber: {numberLong:String}

 @Prop()
 serializedPayload:String
 @Prop()
 timestamp:String
 @Prop()
 payloadType:String
 @Prop()
 payloadRevision:String
 @Prop()
 serializedMetaData:String
 @Prop()
 eventIdentifier:String
}

export const DomaineventsSchema = SchemaFactory.createForClass(Domainevents);