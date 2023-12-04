import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ChallengeReadDocument = ChallengeRead & Document;

@Schema({ collection: 'challenge' })
export class ChallengeRead {
    _id: mongoose.Types.ObjectId;
    
    @Prop()
    nameChallenge: string;

    @Prop({ type: Object })
    jenisChallenge: { oid: String; };

    @Prop()
    description: String;

    @Prop()
    createdAt: string;

    @Prop()
    updatedAt: string;

    @Prop()
    durasi: number;

    @Prop()
    startChallenge: string;

    @Prop()
    endChallenge: string;

    @Prop()
    startTime: string;

    @Prop()
    endTime: string;

    @Prop()
    jumlahSiklusdurasi: number;

    @Prop()
    tampilStatusPengguna: boolean;
    
    @Prop()
    objectChallenge: string;

    @Prop()
    statusChallenge: string;

    @Prop([{ type: Object }])
    metrik: any[];

    @Prop([{ type: Object }])
    peserta: any[];
    
    @Prop([{ type: Object }])
    leaderBoard: any[];

    @Prop([{ type: Object }])
    ketentuanHadiah: any[];

    @Prop([{ type: Object }])
    hadiahPemenang: any[];

    @Prop([{ type: Object }])
    bannerSearch: any[];

    @Prop([{ type: Object }])
    popUp: any[];
    
    @Prop([{ type: Object }])
    notifikasiPush: any[];

    @Prop([])
    listParticipant: [];
}

export const ChallengeReadSchema = SchemaFactory.createForClass(ChallengeRead);