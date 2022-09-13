import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserplaylistDocument = Userplaylist & Document;

@Schema()
export class Userplaylist {
  @Prop({ type: Object })
  _id: { oid: String };
  @Prop()
  userId: { oid: String };
  @Prop()
  interestId: [{
    $ref: String;
    $id: { oid: String };
    $db: String;
  }];
  @Prop()
  userPostId: { oid: String };
  @Prop()
  postType: String;
  @Prop()
  mediaId: { oid: String };
  @Prop()
  type: String;
  @Prop()
  createAt: String;
  @Prop()
  updatedAt: String;
  @Prop()
  isWatched: boolean;
}

export const UserplaylistSchema = SchemaFactory.createForClass(Userplaylist);