import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Long } from "mongodb";

export type PostsDocument = Posts & Document;

@Schema()
export class Posts {
  @Prop()
  _id: String;
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
  createdAt: String  
  @Prop()
  updatedAt: String
  @Prop()
  expiration: Long;
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
  @Prop()
  certified: boolean
  @Prop()
  saleAmount: number
  @Prop()
  saleLike: boolean
  @Prop()
  saleView: boolean    

  @Prop({ type: Object })
  metadata: {
    duration: Number
    postRoll: Number
    postType: String
    preRoll: Number
    midRoll: Number
    postID: String
    email: String
  }

  @Prop()
  likes: Long;
  @Prop()
  views: Long;
  @Prop()
  shares: Long;
  @Prop()
  comments: Long;
  @Prop()
  reactions: Long;

  @Prop({ type: Object })
  userProfile: any;

  @Prop()
  contentMedias: any[];  

  @Prop()
  _class: String

  @Prop()
  lat: number;  

  @Prop()
  lon: number;    

  @Prop()
  category: any[];

  @Prop()
  tagPeople: any[];
  
  @Prop()
  tagDescription: any[];  
  
}

export const PostsSchema = SchemaFactory.createForClass(Posts);