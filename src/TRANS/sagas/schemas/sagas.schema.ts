import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type SagasDocument = Sagas & Document ;

@Schema()
export class Sagas {
    @Prop({type: mongoose.Schema.Types.ObjectId})
    _id: { oid:String  }
  @Prop()
  sagaType: string

  @Prop()
  sagaIdentifier: String

  @Prop({type:Object})
  serializedSaga: {
    binary:{
        base64:String
        subType:String
    }
  }

  @Prop([{}])
 associations:[{
    key:String
   
    value:String
}];
}

export const SagasSchema = SchemaFactory.createForClass(Sagas);