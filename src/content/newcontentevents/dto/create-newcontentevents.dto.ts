import { UtilsService } from "../../../utils/utils.service";
import mongoose from "mongoose";
export class NewcontenteventsDto {


    _id: String;
    contentEventID: String;
    email: String;
    eventType: String;
    active: boolean;
    event: String;
    createdAt: String;
    updatedAt: String;
    sequenceNumber: Number;
    flowIsDone: boolean;
    senderParty: String;
    receiverParty: String;
    _class: String;
    postID: String;
    idEmail: mongoose.Types.ObjectId;
    idSender: mongoose.Types.ObjectId;
    idReceiver: mongoose.Types.ObjectId;
    reactionUri: String;
    parentContentEventID: String;
    transitions: [
        {
            $ref: String;
            $id: { oid: String };
            $db: String;
        },
    ];
}

export class ContentEventId {
    dtoID: String;
    eventType: String;
    parent: NewcontenteventsDto;
    last: NewcontenteventsDto;
    next: NewcontenteventsDto;
    validActivity: boolean;
}