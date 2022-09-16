import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type RemovedreasonsDocument = Removedreasons & Document;

@Schema()
export class Removedreasons {

    _id: mongoose.Types.ObjectId;
    @Prop()
    reason: string;
    @Prop()
    description: string;

}

export const RemovedreasonsSchema = SchemaFactory.createForClass(Removedreasons);