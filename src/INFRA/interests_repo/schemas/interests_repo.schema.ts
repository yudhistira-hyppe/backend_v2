import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type InterestsrepoDocument = Interestsrepo & Document ;

@Schema({ collection: 'interests_repo' })
export class Interestsrepo {
 @Prop({type: mongoose.Schema.Types.ObjectId})
 _id: { oid:String  }

  @Prop()
  interestName: string;

  @Prop()
  langIso: String
  @Prop()
  icon: String

  @Prop()
 createdAt: String
 @Prop()
 updatedAt: String
 @Prop()
 _class:String
}

export const InterestsrepoSchema = SchemaFactory.createForClass(Interestsrepo);