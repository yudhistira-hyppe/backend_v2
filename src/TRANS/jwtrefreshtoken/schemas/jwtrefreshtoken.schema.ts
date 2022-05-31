import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type JwtrefreshtokenDocument = Jwtrefreshtoken & Document ;

@Schema({ collection: 'jwtrefreshtoken' })
export class Jwtrefreshtoken {
  //    @Prop({type: mongoose.Schema.Types.ObjectId})
  //   _id: { oid:String  }
  @Prop()
  refresh_token_id: String;
  @Prop()
  email: String;

  @Prop({ type: Object })
  iat: { numberLong: String };
  @Prop({ type: Object })
  exp: { numberLong: String };
  @Prop({ type: Object })
  userAuth: {
    type: mongoose.Schema.Types.ObjectId;
    ref: 'Ingredient';
  };

  @Prop()
  _class: String;
}

export const JwtrefreshtokenSchema = SchemaFactory.createForClass(Jwtrefreshtoken);