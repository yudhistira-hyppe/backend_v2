import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type FsfilesDocument = Fsfiles & Document ;

@Schema({ collection: 'fs.files' })
export class Fsfiles {
 @Prop({type: mongoose.Schema.Types.ObjectId})
 _id: { oid:String  }

  @Prop()
  filename: String
  @Prop({ type: Object })
  length:{ numberLong:String  }
  @Prop()
  chunkSize: Number
  @Prop({ type: Object })
  uploadDate:{ date:{ numberLong:String  } }
  @Prop({type:Object})
  metadata: { 
    repo_type:String
    fileName:String
    flow:String
    _class:String
    }
}

export const FsfilesSchema = SchemaFactory.createForClass(Fsfiles);