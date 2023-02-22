import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type InterestdayDocument = Interestday & Document;

@Schema({ collection: 'interestday' })
export class Interestday {
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    _id: { oid: String }

    @Prop()
    date: string;

    @Prop()
    listinterest: any[]
}

export const InterestdaySchema = SchemaFactory.createForClass(Interestday);