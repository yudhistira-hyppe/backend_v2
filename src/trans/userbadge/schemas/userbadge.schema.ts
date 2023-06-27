import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Double } from 'mongodb';
import mongoose, { Document } from 'mongoose';

export type UserbadgeDocument = Userbadge & Document;

@Schema({ collection: 'userBadge' })
export class Userbadge {

    _id: mongoose.Types.ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    SubChallengeId: mongoose.Types.ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    userId: mongoose.Types.ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    idBadge: mongoose.Types.ObjectId;
    @Prop()
    session: number;
    @Prop()
    startDatetime: String;
    @Prop()
    endDatetime: String;
    @Prop()
    createdAt: String;
    @Prop()
    isActive: boolean;


}
export const UserbadgeSchema = SchemaFactory.createForClass(Userbadge);