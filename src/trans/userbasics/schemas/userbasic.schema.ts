import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserbasicDocument = Userbasic & Document ;

@Schema()
export class Userbasic {
  @Prop({ type: Object })
  _id: { oid: String };
  @Prop()
  profileID: string;
  @Prop()
  email: String;
  @Prop()
  fullName: String;
  @Prop()
  dob: String;
  @Prop()
  gender: String;
  @Prop()
  mobileNumber: String;
  @Prop()
  status: String;
  @Prop()
  event: String;
  @Prop()
  idProofName: String;
  @Prop()
  idProofNumber: String;
  @Prop()
  idProofStatus: String;
  @Prop()
  isComplete: boolean;
  @Prop()
  isCelebrity: boolean;
  @Prop()
  isIdVerified: boolean;
  @Prop()
  isPrivate: boolean;
  @Prop()
  isFollowPrivate: boolean;
  @Prop()
  isPostPrivate: boolean;

  @Prop()
  createdAt: String;
  @Prop()
  updatedAt: String;
  @Prop()
  bio: String;
  @Prop({ type: Object })
  profilePict: {
    ref: String;
    id: String;
    db: String;
  };
  @Prop({ type: Object })
  proofPict: {
    ref: String;
    id: String;
    db: String;
  };
  @Prop({ type: Object })
  insight: {
    ref: String;
    id: String;
    db: String;
  };
  @Prop([{ type: Object }])
  userInterests: [
    {
      ref: String;
      id: {
        oid: String;
      };
      db: String;
    },
  ];
  @Prop({ type: Object })
  userAuth: {
    ref: String;
    id: {
      oid: String;
    };
    db: String;
  };
  @Prop({ type: Object })
  cities: {
    ref: String;
    id: {
      oid: String;
    };
    db: String;
  };
  @Prop({ type: Object })
  states: {
    ref: String;
    id: {
      oid: String;
    };
    db: String;
  };
  @Prop({ type: Object })
  countries: {
    ref: String;
    id: {
      oid: String;
    };
    db: String;
  };
  @Prop({ type: Object })
  languages: {
    ref: String;
    id: {
      oid: String;
    };
    db: String;
  };
  @Prop()
  _class: String;
}

export const UserbasicSchema = SchemaFactory.createForClass(Userbasic);