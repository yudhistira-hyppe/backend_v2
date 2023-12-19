import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { integer } from 'aws-sdk/clients/lightsail';
import mongoose, { Document } from 'mongoose';
import { Long } from "mongodb";

export type MediastreamingrequestDocument = Mediastreamingrequest & Document ;

@Schema({ collection: 'mediastreamingrequest' })
export class Mediastreamingrequest{
    _id: mongoose.Types.ObjectId;
    @Prop()
    url: String;
    @Prop({ type: Object })
    request: {}
    @Prop({ type: Object })
    response: {}
    @Prop()
    createAt: String;
    @Prop()
    updateAt: String;
}
export const MediastreamingrequestSchema = SchemaFactory.createForClass(Mediastreamingrequest);