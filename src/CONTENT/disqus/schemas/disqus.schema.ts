import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type DisqusDocument = Disqus & Document ;

@Schema()
export class Disqus {
 @Prop()
 _id:String;

  @Prop()
  disqusID: String
  @Prop()
  email: String
  @Prop()
  mate: String
  @Prop()
  eventType: String
  @Prop()
  active: boolean
  @Prop()
  room: String
  @Prop()
 createdAt: String
 @Prop()
 updatedAt: String
 @Prop()
 lastestMessage:String
 @Prop([{type:Object}])
 disqusLogs: [{
    ref:String
    id:String
    db:String
}]
 @Prop()
 _class:String
}

export const DisqusSchema = SchemaFactory.createForClass(Disqus);