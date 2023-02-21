import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type TagCountDocument = TagCount & Document;

@Schema({ collection: 'tag_count' })
export class TagCount {
    @Prop()
    _id: string

    @Prop()
    total: number;

    @Prop()
    listdata: any[]
}

export const TagCountSchema = SchemaFactory.createForClass(TagCount);