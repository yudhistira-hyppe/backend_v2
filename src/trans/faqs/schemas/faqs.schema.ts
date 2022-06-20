import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type FaqsDocument = Faqs & Document;

@Schema({ collection: 'faqs' })
export class Faqs {
  //  @Prop({type: mongoose.Schema.Types.ObjectId})
  // _id: { oid:string  }

  @Prop()
  subject: string;

  @Prop()
  body: string
  @Prop()
  datetime: string


  @Prop({ type: Object })
  IdUser: { oid: string; }

  @Prop()
  status: string

}

export const FaqsSchema = SchemaFactory.createForClass(Faqs);