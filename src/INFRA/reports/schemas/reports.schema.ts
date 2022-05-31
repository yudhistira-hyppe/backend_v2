import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ReportsDocument = Reports & Document ;

@Schema()
export class Reports {
 @Prop({type: mongoose.Schema.Types.ObjectId})
 _id: { oid:String  }

  @Prop()
  action: string;

  @Prop()
  remark: String
 
  @Prop()
  remarkID: String
  @Prop()
  reportType: String
  @Prop()
  langIso: String
  @Prop()
 createdAt: String
 @Prop()
 updatedAt: String
 @Prop()
 _class:String
}

export const ReportsSchema = SchemaFactory.createForClass(Reports);