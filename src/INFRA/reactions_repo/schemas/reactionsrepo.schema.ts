import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ReactionsrepoDocument = Reactionsrepo & Document ;

@Schema({collection:'reactions_repo'})
export class Reactionsrepo {
 @Prop({type: mongoose.Schema.Types.ObjectId})
 _id: { oid:String  }

  @Prop()
  reactionId: string;

  @Prop()
  iconName: String
 
  @Prop()
  URL: String
  @Prop()
  icon: String
  @Prop()
  utf: String
  @Prop()
  cts: String
  @Prop()
 createdAt: String
 @Prop()
 updatedAt: String
 @Prop()
 _class:String
}

export const ReactionsrepoSchema = SchemaFactory.createForClass(Reactionsrepo);