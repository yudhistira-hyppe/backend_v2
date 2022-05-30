import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type SnapshoteventsDocument = Snapshotevents & Document ;

@Schema()
export class Snapshotevents {
    @Prop({type: mongoose.Schema.Types.ObjectId})
    _id: { oid:String  }
  @Prop()
  aggregateIdentifier: string;

  @Prop()
  type: String

  @Prop({ type: Object })
  sequenceNumber: { numberLong:String }

  @Prop()
  serializedPayload: String
 @Prop()
 timestamp: String
 @Prop()
 payloadType:String
 @Prop()
 payloadRevision:String
 @Prop()
 serializedMetaData:String
 @Prop()
 eventIdentifier:String
}

export const SnapshoteventsSchema = SchemaFactory.createForClass(Snapshotevents);