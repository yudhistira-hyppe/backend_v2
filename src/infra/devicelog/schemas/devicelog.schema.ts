import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type DevicelogDocument = Devicelog & Document ;

@Schema({ collection: 'devicelog' })
export class Devicelog {
    @Prop({type: mongoose.Schema.Types.ObjectId})
    _id: { oid:String  }
    @Prop()
    email: String;
    @Prop()
    imei: String;
    @Prop()
    log: String;
    @Prop()
    type: String;
    @Prop()
    createdAt: String
    @Prop()
    updatedAt: String
    @Prop()
    _class:String
}

export const DevicelogSchema = SchemaFactory.createForClass(Devicelog);