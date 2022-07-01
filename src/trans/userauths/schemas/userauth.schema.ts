import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserauthDocument = Userauth & Document ;

@Schema()
export class Userauth {
  @Prop({ type: Object })
  _id: { oid: String };
  @Prop()
  username: string;
  @Prop()
  password: string;
  @Prop()
  userID: String;
  @Prop()
  email: String;
  @Prop()
  regSrc: String;
  @Prop()
  createdAt: String;
  @Prop()
  updatedAt: String;
  @Prop()
  isExpiryPass: boolean;
  @Prop()
  isEmailVerified: boolean;

  @Prop({ type: Object })
  otpRequestTime: {
    numberLong: String;
  };
  @Prop({ type: Object })
  otpAttempt: {
    numberLong: String;
  };
  @Prop({ type: Object })
  otpNextAttemptAllow: {
    numberLong: String;
  };
  @Prop()
  isEnabled: boolean;
  @Prop()
  isAccountNonExpired: boolean;
  @Prop()
  isAccountNonLocked: boolean;
  @Prop()
  isCredentialsNonExpired: boolean;

  @Prop()
  roles: [];

  @Prop([{ type: Object }])
  devices: [
    {
      ref: String;
      id: {
        oid: String;
      };
      db: String;
    },
  ];

  @Prop()
  _class: String;

  @Prop()
  oneTimePassword: String;
}

export const UserauthSchema = SchemaFactory.createForClass(Userauth);