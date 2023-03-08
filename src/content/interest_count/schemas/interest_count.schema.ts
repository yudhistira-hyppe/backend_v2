import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type InterestCountDocument = InterestCount & Document;

@Schema({ collection: 'interest_count' })
export class InterestCount {

    _id: mongoose.Schema.Types.ObjectId
    @Prop()
    total: number;

    @Prop()
    listdata: any[]
}

export const InterestCountSchema = SchemaFactory.createForClass(InterestCount);