import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type FschunksDocument = Fschunks & Document ;

@Schema({ collection: 'fs.chunks' })
export class Fschunks {
 @Prop({type: mongoose.Schema.Types.ObjectId})
 _id: { oid:String  }

 @Prop({type: mongoose.Schema.Types.ObjectId})
  files_id: { oid:String  }

  @Prop()
  n: Number
  @Prop({ type: Object })
  data: {
    binary:{
        base64:String
        subType:String
     }  
  }
}

export const FschunksSchema = SchemaFactory.createForClass(Fschunks);