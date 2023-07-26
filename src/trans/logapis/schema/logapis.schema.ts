import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type logApisDocument = logApis & Document;

@Schema({ collection: 'logApis' })
export class logApis {
    _id: mongoose.Types.ObjectId;
    
    @Prop()
    url: String;

    @Prop()
    timestamps_start: String;

    @Prop()
    timestamps_end: String;
    
    @Prop()
    email: String;
    
    @Prop()
    iduser: String;
    
    @Prop()
    username: String;

    @Prop([{ type: Object }])
    requestBody: any[];
}

export const logApisSchema = SchemaFactory.createForClass(logApis);