import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type FriendListDocument = FriendList & Document;

@Schema({ collection: 'friend_list' })
export class FriendList {
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    _id: { oid: String }

    @Prop()
    email: string

    @Prop()
    fullName: string

    @Prop()
    username: string

    @Prop()
    totalfriend:number

    @Prop()
    friendlist: any[]
}

export const FriendListSchema = SchemaFactory.createForClass(FriendList);