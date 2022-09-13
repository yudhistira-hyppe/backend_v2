import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserticketsDocument = Usertickets & Document;

@Schema({ collection: 'usertickets' })
export class Usertickets {
  //  @Prop({type: mongoose.Schema.Types.ObjectId})
  // _id: { oid:string  }
  _id: mongoose.Types.ObjectId;
  @Prop()
  nomortiket: string;
  @Prop()
  subject: string;
  @Prop()
  body: string;
  @Prop()
  datetime: string;
  @Prop({ type: Object })
  IdUser: { oid: string; }
  @Prop()
  status: string;
  @Prop()
  active: boolean;
  @Prop()
  isRead: boolean;
  @Prop({ type: Object })
  levelTicket: { oid: string; };
  @Prop({ type: Object })
  sourceTicket: { oid: string; };
  @Prop({ type: Object })
  categoryTicket: { oid: string; };
  @Prop({ type: Object })
  assignTo: { oid: string; };
  @Prop()
  mediaType: String
  @Prop()
  mediaBasePath: String
  @Prop()
  mediaUri: any[]
  @Prop()
  originalName: any[]
  @Prop()
  fsSourceUri: any[]
  @Prop()
  fsSourceName: any[]
  @Prop()
  fsTargetUri: any[]
  @Prop()
  mediaMime: String
  @Prop()
  version: number
  @Prop()
  OS: string


}

export const UserticketsSchema = SchemaFactory.createForClass(Usertickets);