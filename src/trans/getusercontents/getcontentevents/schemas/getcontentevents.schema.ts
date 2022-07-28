import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type GetcontenteventsDocument = Getcontentevents & Document;

@Schema({ collection: 'contentevents2' })
export class Getcontentevents {
    @Prop()
    _id: String;

    @Prop()
    contentEventID: String
    @Prop()
    email: String
    @Prop()
    eventType: String
    @Prop()
    active: boolean
    @Prop()
    event: String
    @Prop()
    createdAt: String
    @Prop()
    updatedAt: String
    @Prop()
    sequenceNumber: Number
    @Prop()
    flowIsDone: boolean
    @Prop()
    _class: String
    @Prop()
    postID: String;
    @Prop()
    senderParty: String;
    @Prop()
    receiverParty: String;
}

export const GetcontenteventsSchema = SchemaFactory.createForClass(Getcontentevents);