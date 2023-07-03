import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Double } from 'mongodb';
import mongoose, { Document } from 'mongoose';

export type PostchallengeDocument = Postchallenge & Document;

@Schema({ collection: 'postChallenge' })
export class Postchallenge {

    _id: mongoose.Types.ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    idChallenge: mongoose.Types.ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    idSubChallenge: mongoose.Types.ObjectId;
    @Prop()
    startDatetime: String;
    @Prop()
    endDatetime: String;
    @Prop()
    createdAt: String;
    @Prop()
    postID: String;
    @Prop()
    session: number;
    @Prop()
    updatedAt: String;
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    idUser: mongoose.Types.ObjectId;
    @Prop()
    score: number;


}
export const PostchallengeSchema = SchemaFactory.createForClass(Postchallenge);