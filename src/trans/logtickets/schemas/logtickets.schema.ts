import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type LogticketsDocument = Logtickets & Document;

@Schema()
export class Logtickets {

    _id: mongoose.Types.ObjectId;

    @Prop({ type: Object })
    ticketId: { oid: String; };
    @Prop({ type: Object })
    userId: { oid: String; };
    @Prop()
    type: string;
    @Prop()
    remark: string;
    @Prop()
    createdAt: string;

}

export const LogticketsSchema = SchemaFactory.createForClass(Logtickets);