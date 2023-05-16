import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { distinctUntilChanged } from 'rxjs';

export type SettingsDocument = SettingsArray & Document;
@Schema({ collection:'settings' })
export class SettingsArray {
    //@Prop({ type: mongoose.Schema.Types.ObjectId })
    _id: mongoose.Schema.Types.ObjectId
    @Prop()
    jenis: string
    @Prop()
    value: any[]
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

export const Settings4Schema = SchemaFactory.createForClass(SettingsArray);