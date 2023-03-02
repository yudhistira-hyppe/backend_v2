import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserscoresDocument = Userscores & Document;

@Schema({ collection: 'userscores' })
export class Userscores {
    // @Prop({ type: mongoose.Schema.Types.ObjectId })
    _id: Object;

    @Prop()
    date: string;
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    iduser: { oid: String }

    @Prop()
    totalscore: number;
    @Prop()
    listscore: any[]
}

export const UserscoresSchema = SchemaFactory.createForClass(Userscores);