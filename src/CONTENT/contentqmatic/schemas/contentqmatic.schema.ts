import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ContentqmaticDocument = Contentqmatic & Document ;

@Schema({collection:'contentqmatic'})
export class Contentqmatic {
 @Prop({type: mongoose.Schema.Types.ObjectId})
 _id: { oid:String  }

  @Prop()
  active: boolean;

  @Prop()
  aggrYear:Number
  @Prop()
  aggrMonth:Number
  @Prop()
  aggrWeek:Number
  @Prop()
  aggrDay:Number
  @Prop([{type:Object}])
  contents:[
    {
        allowComments:boolean
        createdAt:String
        postType:String
        active:boolean
        postID:String
        email:String
        tags:[];
        updatedAt:String
        
    }
]
  @Prop()
 _class:String
}

export const ContentqmaticSchema = SchemaFactory.createForClass(Contentqmatic);