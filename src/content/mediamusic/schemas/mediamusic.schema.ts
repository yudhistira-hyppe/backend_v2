import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { integer } from 'aws-sdk/clients/lightsail';
import mongoose, { Document } from 'mongoose';

export type MediamusicDocument = Mediamusic & Document ;

@Schema({ collection: 'mediamusic' })
export class Mediamusic{
    _id: mongoose.Types.ObjectId;
    @Prop()
    musicTitle: String
    @Prop()
    artistName: String
    @Prop()
    albumName: String
    @Prop({ type: Object })
    genre: { oid: String; };
    @Prop({ type: Object })
    theme: { oid: String; };
    @Prop({ type: Object })
    mood: { oid: String; };
    @Prop()
    releaseDate: Date
    @Prop()
    isDelete: boolean
    @Prop()
    isActive: boolean
    @Prop()
    createdAt: Date
    @Prop()
    updatedAt: Date
    @Prop()
    used: number;
    @Prop()
    apsaraMusic: String;
    @Prop()
    apsaraThumnail: String
}
export const MediamusicSchema = SchemaFactory.createForClass(Mediamusic);