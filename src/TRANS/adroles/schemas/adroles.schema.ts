import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AdrolesDocument = Adroles & Document ;

@Schema()
export class Adroles {
    @Prop({type: mongoose.Schema.Types.ObjectId})
    _id: { oid:String  }
  @Prop()
  name: string

  @Prop()
  isSysAdmin: String

  
}

export const AdrolesSchema = SchemaFactory.createForClass(Adroles);