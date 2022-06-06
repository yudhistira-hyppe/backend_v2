import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Collection, Document } from 'mongoose';

export type GetusercontentsDocument = Getusercontents & Document ;

@Schema({collection:'posts2'})
export class Getusercontents {
 @Prop()
 _id:String;
  @Prop()
  postID: String
  @Prop()
  email: String
  @Prop()
  postType: String
  @Prop()
  description: String
  @Prop()
  active: boolean

 @Prop()
 updatedAt: String
  @Prop({type:Object})
  expiration: {
    numberLong:String
  }
  @Prop()
  visibility: String
  @Prop()
  location: String
  @Prop([])
  tags: []
  @Prop()
  allowComments: boolean
  @Prop()
  isSafe: boolean
  @Prop()
  isOwned: boolean

  @Prop({type:Object})
  metadata: {
    duration: Number
    postRoll: Number
    postType: String
    preRoll: Number
    midRoll: Number
    postID: String
    email: String
  }
  
  @Prop({type:Object})
  likes: {
    numberLong:String
  }
  @Prop({type:Object})
  views: {
    numberLong:String
  }
  @Prop({type:Object})
  shares: {
    numberLong:String
  }
  @Prop({type:Object})
  comments: {
    numberLong:String
  }

  @Prop({type:Object})
  userProfile: {
    ref: String
    id: {
      oid: String
    };
    db:String
  }
 
  @Prop([{type:Object}])
  contentMedias:[{
        ref: String
        id:String
        db:String
  }]
 @Prop()
 _class:String
}

export const GetusercontentsSchema = SchemaFactory.createForClass(Getusercontents);