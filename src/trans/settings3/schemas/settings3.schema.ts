import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { distinctUntilChanged } from 'rxjs';

export type SettingsDocument = SettingsString & Document;
@Schema({ collection:'settings' })
export class SettingsString {
    //@Prop({ type: mongoose.Schema.Types.ObjectId })
    _id: mongoose.Schema.Types.ObjectId
    @Prop()
    jenis: string
    @Prop()
    value: string
    @Prop()
    jenisdata: string
    @Prop()
    typedata: string
    @Prop()
    remark: string
    @Prop()
    Max: number
    @Prop()
    Min: number

    @Prop({ type: Object })
    sortObject: {}


}

export const Settings3Schema = SchemaFactory.createForClass(SettingsString);