import { IsNotEmpty, IsNumberString } from "class-validator";
import mongoose from "mongoose";

export class VoucherPromoDto {
    readonly _id: mongoose.Types.ObjectId;
    nameVoucher: string;
    descVoucher: string;
    codeVoucher: string;
    type: string;
    value: number;
    quantity: number;
    dateStart: string;
    dateEnd: string;
    status: boolean;
    createAt: string;
    updateAt: string;
}