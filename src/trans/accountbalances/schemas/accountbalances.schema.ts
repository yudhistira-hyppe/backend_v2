import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AccountbalancesDocument = Accountbalances & Document;

@Schema()
export class Accountbalances {
    _id: mongoose.Types.ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    iduser: { oid: String }
    @Prop()
    debet: number

    @Prop()
    kredit: number
    @Prop()
    type: string

    @Prop()
    timestamp: string
    @Prop()
    description: string
    @Prop()
    idtrans: mongoose.Types.ObjectId;

}

export const AccountbalancesSchema = SchemaFactory.createForClass(Accountbalances);