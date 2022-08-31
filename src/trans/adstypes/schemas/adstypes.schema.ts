import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AdstypesDocument = Adstypes & Document;

@Schema()
export class Adstypes {
    _id: mongoose.Types.ObjectId;
    @Prop()
    nameType: string;
    @Prop()
    creditValue: number;
    @Prop()
    mediaType: string;
    @Prop([])
    sizeType: [];
    @Prop([])
    formatType: [];
    @Prop()
    descType: string;
    @Prop()
    AdsSkip: number;
    @Prop()
    rewards: number;  


}

export const AdstypesSchema = SchemaFactory.createForClass(Adstypes);