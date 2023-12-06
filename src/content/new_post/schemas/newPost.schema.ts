import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
// import { Long } from "mongodb";

export type NewpostsDocument = newPosts & Document;

@Schema({ collection: 'newPosts' })
export class newPosts {
  @Prop()
  _id: String;
  @Prop()
  postID: String;
  @Prop()
  email: String;
  @Prop()
  postType: String;
  @Prop()
  description: String;
  @Prop()
  active: Boolean;
  @Prop()
  createdAt: String;
  @Prop()
  updatedAt: String;
  @Prop({ type: Object })
  expiration:
    {
      numberLong: String
    };
  @Prop()
  visibility: String;
  @Prop()
  location: String;
  @Prop()
  tags: any[];
  @Prop()
  allowComments: Boolean;
  @Prop()
  isSafe: Boolean;
  @Prop()
  isOwned: Boolean;
  @Prop({ type: Object })
  likes: {
    numberLong: String
  }
  @Prop({ type: Object })
  views: {
    numberLong: String
  }
  @Prop({ type: Object })
  shares: {
    numberLong: String
  }
  @Prop()
  saleLike: Boolean;
  @Prop()
  saleView: Boolean;
  @Prop()
  saleAmount: number;
  @Prop({ type: Object })
  userProfile: any;
  @Prop()
  category: any[];
  @Prop()
  tagPeople: any[];
  @Prop()
  tagDescription: any[];
  @Prop()
  contentMedias: any[];
  @Prop()
  boosted: any[];
  @Prop()
  viewer: any[];
  @Prop()
  userView: any[];
  @Prop()
  userLike: any[];
  @Prop()
  _class: any[];
  @Prop()
  mediaBasePath: any[];
  @Prop()
  mediaUri: any[];
  @Prop()
  originalName: any[];
  @Prop()
  fsSourceUri: any[];
  @Prop()
  fsTargetUri: any[];
  @Prop()
  mediaMime: any[];
  @Prop()
  descMigration: any[];
  @Prop()
  statusMigration: any[];
  @Prop()
  apsara: any[];
  @Prop()
  mediaThumBasePath: any[];
  @Prop()
  mediaThumUri: any[];
  @Prop()
  uploadSource: any[];
  @Prop()
  mediaType: string;
  @Prop()
  apsaraId: string;
  @Prop()
  rotate: number
  @Prop()
  reactions: number;
  @Prop()
  mediaSource: any[];
  @Prop()
  isBoost: number;
}

export const NewpostsSchema = SchemaFactory.createForClass(newPosts);