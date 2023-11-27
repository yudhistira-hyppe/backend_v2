import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type SettingsReadDocument = SettingsRead & Document;

@Schema({ collection: 'settings' })
export class SettingsRead {
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
export const SettingsReadSchema = SchemaFactory.createForClass(SettingsRead);