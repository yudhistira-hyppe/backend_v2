import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type SubChallengeReadDocument = SubChallengeRead & Document;

@Schema({ collection: 'subChallenge' })
export class SubChallengeRead {
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

export const SubChallengeReadSchema = SchemaFactory.createForClass(SubChallengeRead);