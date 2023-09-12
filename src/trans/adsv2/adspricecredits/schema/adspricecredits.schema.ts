import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { Document } from 'mongoose';

export type AdsPriceCreditsDocument = AdsPriceCredits & Document;

@Schema()
export class AdsPriceCredits {
    _id: mongoose.Types.ObjectId;
    @Prop({ type: Object })
    iduser: mongoose.Types.ObjectId;
    @Prop()
    creditPrice: number;
    @Prop()
    remark: number;
    @Prop()
    status: boolean;
    @Prop()
    createAt: string;
    @Prop()
    updateAt: string;
}
export const AdsPriceCreditsSchema = SchemaFactory.createForClass(AdsPriceCredits);