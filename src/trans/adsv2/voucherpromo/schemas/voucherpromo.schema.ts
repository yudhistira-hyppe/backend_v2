import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type VoucherPromoDocument = VoucherPromo & Document;

@Schema({ collection: 'voucher_promo' })
export class VoucherPromo {
    _id: mongoose.Types.ObjectId;
    @Prop()
    nameVoucher: string;
    @Prop()
    codeVoucher: string;
    @Prop()
    descVoucher: string;
    @Prop()
    type: string;
    @Prop()
    value: number;
    @Prop()
    quantity: number;
    @Prop()
    dateStart: string;
    @Prop()
    dateEnd: string;
    @Prop()
    status: boolean;
    @Prop()
    createAt: string;
    @Prop()
    updateAt: string;
}
export const VoucherPromoSchema = SchemaFactory.createForClass(VoucherPromo);