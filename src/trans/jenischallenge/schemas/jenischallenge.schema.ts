import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type jenisChallengeDocument = jenisChallenge & Document;

@Schema({ collection: 'jenisChallenge' })
export class jenisChallenge {
    _id: mongoose.Types.ObjectId;
    
    @Prop()
    name: string

    @Prop()
    description: String

    @Prop()
    isActive: Boolean
}

export const jenisChallengeSchema = SchemaFactory.createForClass(jenisChallenge);