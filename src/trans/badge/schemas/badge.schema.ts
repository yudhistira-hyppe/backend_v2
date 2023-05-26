import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type badgeDocument = badge & Document;

@Schema({ collection: 'badge' })
export class badge {
    _id: mongoose.Types.ObjectId;
    
    @Prop()
    name: string

    @Prop()
    type: String

    @Prop()
    badgeProfile: String
    
    @Prop()
    badgeOther: String

    @Prop()
    createdAt: String
}

export const badgeSchema = SchemaFactory.createForClass(badge);