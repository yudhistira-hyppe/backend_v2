import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type DisquscontactsDocument = Disquscontacts & Document ;

@Schema()
export class Disquscontacts {
 @Prop()
 _id:String;


  @Prop()
  active: boolean
  @Prop()
  email: String
  @Prop()
  mate: String
 
 @Prop({type:Object})
 disqus: {
    ref:String
    id:String
    db:String
}
 @Prop()
 _class:String
}

export const DisquscontactsSchema = SchemaFactory.createForClass(Disquscontacts);