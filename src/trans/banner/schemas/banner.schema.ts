import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

export type BannerDocument = Banner & Document;

@Schema({ collection: 'banner' })
export class Banner {
    _id: mongoose.Types.ObjectId;
    @Prop()
    title: string;
    @Prop()
    url: string;
    @Prop()
    image: string;
    @Prop()
    createdAt: string;
    @Prop()
    email: string;
    @Prop()
    statusTayang: boolean;
    @Prop()
    active: boolean;
}
export const BannerSchema = SchemaFactory.createForClass(Banner)