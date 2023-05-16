import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { distinctUntilChanged } from 'rxjs';

export type SettingsDocument = SettingsBoolean & Document;
@Schema({ collection:'settings' })
export class SettingsBoolean {
    //@Prop({ type: mongoose.Schema.Types.ObjectId })
    _id: mongoose.Schema.Types.ObjectId
    @Prop()
    jenis: string
    @Prop()
    value: boolean
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

export const Settings2Schema = SchemaFactory.createForClass(SettingsBoolean);