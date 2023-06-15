import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type subchallengeDocument = subChallenge & Document;

@Schema({ collection: 'subChallenge' })
export class subChallenge {
    _id: mongoose.Types.ObjectId;
    
    @Prop({ type: Object })
    challengeId: { oid: String; };

    @Prop()
    startDatetime: string;

    @Prop()
    endDatetime: string;

    @Prop()
    session: number;

    @Prop()
    isActive: boolean;
}

export const subChallengeSchema = SchemaFactory.createForClass(subChallenge);