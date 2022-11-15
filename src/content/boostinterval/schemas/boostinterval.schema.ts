import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';

export type BoostintervalDocument = Boostinterval & Document ;

@Schema({ collection: 'boostInterval' })
export class Boostinterval {
    @Prop()
    _id: mongoose.Types.ObjectId;
    @Prop()
    value: String
    @Prop()
    remark: String
    @Prop()
    type: String;
}
export const BoostintervalSchema = SchemaFactory.createForClass(Boostinterval);