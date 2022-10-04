import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserplaylistDocument = Userplaylist & Document;

@Schema()
export class Userplaylist {
  @Prop({ type: Object })
  _id: { oid: String };
  @Prop({ type: Object })
  userId: { oid: String };
  @Prop([{ type: Object }])
  interestId: [{
    $ref: String;
    $id: { oid: String };
    $db: String;
  }];
  @Prop()
  interestIdCount: number;
  @Prop({ type: Object })
  userPostId: { oid: String };
  @Prop()
  postType: String;
  @Prop()
  mediaId: String;
  @Prop()
  type: String;
  @Prop()
  createAt: String;
  @Prop()
  updatedAt: String;
  @Prop()
  isWatched: boolean;
  @Prop()
  isHidden: boolean;
  @Prop()
  postID: String;
  @Prop()
  description: String;
  @Prop()
  expiration: Number;
  @Prop()
  mediaEndpoint: String;
  @Prop()
  mediaThumbEndpoint: String;
  @Prop()
  mediaType: String;
}

export const UserplaylistSchema = SchemaFactory.createForClass(Userplaylist);