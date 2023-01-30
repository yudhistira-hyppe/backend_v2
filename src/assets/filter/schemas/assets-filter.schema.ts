import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AssetsFilterDocument = AssetsFilter & Document;

@Schema({ collection: 'assetsfilter' })
export class AssetsFilter {
    _id: mongoose.Types.ObjectId;
    @Prop()
    namafile: string
    @Prop()
    thumnail: string
    @Prop()
    link: string;
    @Prop()
    status: boolean;
}
export const AssetsFilterSchema = SchemaFactory.createForClass(AssetsFilter);