import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type stickerCategoryDocument = Filtercategory & Document;

@Schema({ collection: 'filterCategory' })
export class Filtercategory {
    _id: mongoose.Types.ObjectId;

    @Prop()
    name: String

    @Prop()
    active: Boolean

    @Prop()
    createdAt: String

    @Prop()
    updatedAt: String
}

export const stickerCategorySchema = SchemaFactory.createForClass(Filtercategory);