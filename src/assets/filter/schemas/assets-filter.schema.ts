import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AssetsFilterDocument = AssetsFilter & Document;

@Schema({ collection: 'assetsfilter' })
export class AssetsFilter {
    _id: mongoose.Types.ObjectId;
    @Prop()
    namafile: string;
    @Prop()
    descFile: string;

    @Prop()
    fileAssetName: String;
    @Prop()
    fileAssetBasePath: String;
    @Prop()
    fileAssetUri: String;

    @Prop()
    mediaName: String;
    @Prop()
    mediaBasePath: String;
    @Prop()
    mediaUri: String;

    @Prop()
    mediaThumName: String;
    @Prop()
    mediaThumBasePath: String;
    @Prop()
    mediaThumUri: String;

    @Prop()
    status: boolean;

    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;

    @Prop()
    category_id: mongoose.Types.ObjectId;
}
export const AssetsFilterSchema = SchemaFactory.createForClass(AssetsFilter);