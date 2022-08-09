import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UservouchersDocument = Uservouchers & Document;

@Schema()
export class Uservouchers {
    _id: mongoose.Types.ObjectId;
    @Prop({ type: Object })
    userID: { oid: String; };
    @Prop({ type: Object })
    voucherID: { oid: String; };
    @Prop()
    createdAt: string;
    @Prop()
    isActive: boolean;
    @Prop()
    totalCredit: number;
    @Prop()
    updatedAt: string;
    @Prop()
    usedCredit: number;
    @Prop()
    voucherCredit: number;


}

export const UservouchersSchema = SchemaFactory.createForClass(Uservouchers);