import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type newRefferalDocument = newRefferal & Document;

@Schema({ collection: 'newRefferal' })
export class newRefferal {

    _id: mongoose.Types.ObjectId;
    @Prop()
    parent: string;
    @Prop()
    children: string;
    @Prop()
    active: boolean;
    @Prop()
    verified: boolean;
    @Prop()
    imei: string;
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
    @Prop()
    _class: string;
    @Prop([{ type: Object }])
    userParent: any[];
    @Prop([{ type: Object }])
    userChild: any[];
    @Prop({ type: Object })
    idParent: { oid: String; };
    @Prop({ type: Object })
    idChildren: { oid: String; };
}

export const newRefferalSchema = SchemaFactory.createForClass(newRefferal);