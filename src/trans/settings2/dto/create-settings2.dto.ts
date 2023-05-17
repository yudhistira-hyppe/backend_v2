import mongoose from 'mongoose';

export class CreateSettings2Dto {
    _id: { oid: String; };
    jenis: string;
    value: mongoose.Schema.Types.Mixed;
    typedata: string;
    jenisdata: string;
    remark: string;
    Max: number;
    Min: number;
    sortObject: {}
}