import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserticketsDocument = Usertickets & Document ;

@Schema({collection:'usertickets'})
export class Usertickets {
  //  @Prop({type: mongoose.Schema.Types.ObjectId})
  // _id: { oid:string  }
  @Prop()
  subject: string;

  @Prop()
  body: string
  @Prop()
  datetime: string

 
@Prop({ type: Object })
IdUser: { oid:string;  }
 
 @Prop()
  status: string

//   @Prop({ type: [{}] })
//  Detail:[
//     {
//        IDUser:{ oid:string;  },
//        body: string,
//        datetime: string,
//        status: string
//     }
//   ]

 
}

export const UserticketsSchema = SchemaFactory.createForClass(Usertickets);