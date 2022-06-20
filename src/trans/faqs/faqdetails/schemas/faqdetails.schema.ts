import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type FaqdetailsDocument = Faqdetails & Document;

@Schema({ collection: 'faqdetails' })
export class Faqdetails {
    //  @Prop({type: mongoose.Schema.Types.ObjectId})
    // _id: { oid:string  }

    @Prop({ type: Object })
    Idfaqs: { oid: string; }
    @Prop()
    subject: string;

    @Prop()
    body: string
    @Prop()
    datetime: string


    @Prop({ type: Object })
    IdUser: { oid: string; }

    @Prop()
    status: string

}

export const FaqdetailsSchema = SchemaFactory.createForClass(Faqdetails);