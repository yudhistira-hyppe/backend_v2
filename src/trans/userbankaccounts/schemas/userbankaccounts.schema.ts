import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserbankaccountsDocument = Userbankaccounts & Document;

@Schema()
export class Userbankaccounts {

    _id: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId })
    idBank: { oid: string }
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    userId: { oid: string }
    @Prop()
    noRek: string
    @Prop()
    nama: string
    @Prop()
    statusInquiry: boolean
    @Prop()
    description: string
    @Prop()
    active: boolean


}

export const UserbankaccountsSchema = SchemaFactory.createForClass(Userbankaccounts);