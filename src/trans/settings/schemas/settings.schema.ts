import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type SettingsDocument = Settings & Document;

@Schema({ collection:'settings' })
export class Settings {
    //@Prop({ type: mongoose.Schema.Types.ObjectId })
    _id: mongoose.Schema.Types.ObjectId
    @Prop()
    jenis: string
    @Prop()
    jenisdata: string
    @Prop()
    typedata: string
    @Prop()
    value: number
    @Prop()
    remark: string
    @Prop()
    Max: number
    @Prop()
    Min: number
    @Prop()
    isActive:boolean

    @Prop({ type: Object })
    sortObject: {}




}

export const SettingsSchema = SchemaFactory.createForClass(Settings);