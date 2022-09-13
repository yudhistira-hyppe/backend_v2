import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserticketdetailsDocument = Userticketdetails & Document;

@Schema({ collection: 'userticketdetails' })
export class Userticketdetails {
    //  @Prop({type: mongoose.Schema.Types.ObjectId})
    // _id: { oid:string  }

    @Prop({ type: Object })
    IdUserticket: { oid: string; }
    @Prop()
    type: string;

    @Prop()
    body: string
    @Prop()
    datetime: string


    @Prop({ type: Object })
    IdUser: { oid: string; }

    @Prop()
    status: string
    @Prop()
    mediaType: String
    @Prop()
    mediaBasePath: String
    @Prop()
    mediaUri: any[]
    @Prop()
    originalName: any[]
    @Prop()
    fsSourceUri: any[]
    @Prop()
    fsSourceName: any[]
    @Prop()
    fsTargetUri: any[]
    @Prop()
    mediaMime: String

}

export const UserticketdetailsSchema = SchemaFactory.createForClass(Userticketdetails);