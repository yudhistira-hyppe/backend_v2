import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ReportuserDocument = Reportuser & Document;

@Schema({ collection: 'report' })
export class Reportuser {

    _id: mongoose.Types.ObjectId;
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
    @Prop()
    remark: string;
    @Prop()
    type: string;
    @Prop({ type: Object })
    removedReasonId: { oid: String; };
    @Prop()
    reportTypeId: string;
    @Prop({ type: Object })
    updatedBy: { oid: String; };
    @Prop()
    isRemoved: boolean;
    @Prop([])
    detailReport: any[];

}

export const ReportuserSchema = SchemaFactory.createForClass(Reportuser);