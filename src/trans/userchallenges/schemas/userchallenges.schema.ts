import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Double } from 'mongodb';
import mongoose, { Document } from 'mongoose';

export type UserchallengesDocument = Userchallenges & Document;

@Schema({ collection: 'userChallenge' })
export class Userchallenges {

    _id: mongoose.Types.ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    idChallenge: mongoose.Types.ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    idSubChallenge: mongoose.Types.ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    idUser: mongoose.Types.ObjectId;
    @Prop()
    objectChallenge: String;
    @Prop()
    startDatetime: String;
    @Prop()
    endDatetime: String;
    @Prop()
    createdAt: String;
    @Prop()
    updatedAt: String;
    @Prop()
    isActive: boolean;
    @Prop()
    ranking: number;
    @Prop()
    score: number;
    @Prop()
    activity: any[];
    @Prop()
    history: any[];
    @Prop()
    rejectRemark: any[];
    @Prop()
    isBot: boolean;

}
export const UserchallengesSchema = SchemaFactory.createForClass(Userchallenges);