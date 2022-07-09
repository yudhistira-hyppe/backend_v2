import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AnnouncementsDocument = Announcements & Document;

@Schema({ collection: 'announcements' })
export class Announcements {
    //  @Prop({type: mongoose.Schema.Types.ObjectId})
    // _id: { oid:string  }
    @Prop()
    title: string;

    @Prop()
    body: string
    @Prop()
    datetimeCreate: string
    @Prop()
    datetimeSend: string
    @Prop()
    pushMessage: boolean
    @Prop()
    appMessage: boolean
    @Prop()
    appInfo: boolean
    @Prop()
    email: boolean
    @Prop({ type: Object })
    idusershare: { oid: string; }

    @Prop()
    status: string
    @Prop()
    tipe: string
    @Prop({ type: [] })
    Detail: []


}

export const AnnouncementsSchema = SchemaFactory.createForClass(Announcements);