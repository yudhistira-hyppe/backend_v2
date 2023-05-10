import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type SettingsDocument = Settings & Document;

@Schema()
export class Settings {
    //@Prop({ type: mongoose.Schema.Types.ObjectId })
    _id: mongoose.Schema.Types.ObjectId
    @Prop()
    jenis: string

    @Prop()
    value: any
    @Prop()
    remark: string
    @Prop()
    Max: number
    @Prop()
    Min: number

    @Prop({ type: Object })
    sortObject: {}




}

export const SettingsSchema = SchemaFactory.createForClass(Settings);