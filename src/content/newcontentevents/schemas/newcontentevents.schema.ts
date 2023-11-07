import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type NewcontenteventsDocument = Newcontentevents & Document;

@Schema()
export class Newcontentevents {
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
    postID: String;
    @Prop()
    idEmail: mongoose.Types.ObjectId;
    @Prop()
    idSender: mongoose.Types.ObjectId;
    @Prop()
    idReceiver: mongoose.Types.ObjectId;
    @Prop()
    senderParty: String;
    @Prop()
    reactionUri: String;
    @Prop()
    receiverParty: String;
    @Prop()
    _class: String
    @Prop()
    parentContentEventID: String;
    @Prop()
    transitions: [
        {
            $ref: String;
            $id: { oid: String };
            $db: String;
        },
    ];
}

export const NewcontenteventsSchema = SchemaFactory.createForClass(Newcontentevents);