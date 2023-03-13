import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type SettingsDocument = Settings & Document;

@Schema()
export class Settings {
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    _id: { oid: String }
    @Prop()
    jenis: string

    @Prop()
    value: number
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