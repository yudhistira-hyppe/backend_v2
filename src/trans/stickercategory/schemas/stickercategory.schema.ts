import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type stickerCategoryDocument = stickerCategory & Document;

@Schema({ collection: 'stickerCategory' })
export class stickerCategory {
    _id: mongoose.Types.ObjectId;
    
    @Prop()
    name: String

    @Prop()
    icon: String
    
    @Prop()
    type: String

    @Prop()
    active: Boolean
    
    @Prop()
    createdAt: String
    
    @Prop()
    updatedAt: String
}

export const stickerCategorySchema = SchemaFactory.createForClass(stickerCategory);