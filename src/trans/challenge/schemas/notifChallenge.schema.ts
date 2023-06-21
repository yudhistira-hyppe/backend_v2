import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type notifChallengeDocument = notifChallenge & Document;

@Schema({ collection: 'notifChallenge' })
export class notifChallenge {
    _id: mongoose.Types.ObjectId;

    @Prop({ type: Object })
    challengeID: { oid: String; };

    @Prop({ type: Object })
    subChallengeID: { oid: String; };
    @Prop()
    title: string;
    @Prop()
    description: string;

    @Prop()
    type: string;

    @Prop()
    datetime: string;

    @Prop()
    userID: any[];

    @Prop()
    session: number;

    @Prop()
    isSend: boolean;
    @Prop()
    nameChallenge: string;
}

export const notifChallengeSchema = SchemaFactory.createForClass(notifChallenge);