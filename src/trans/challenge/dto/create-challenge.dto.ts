export class CreateChallengeDto {
    _id: { oid: String; };    
    nameChallenge: string;
    jenisChallenge: { oid: String; };
    description: String;
    createdAt: string;
    updatedAt: string;
    durasi: number;
    startChallenge: string;
    endChallenge: string;
    tampilStatusPengguna: boolean;
    objectChallenge: string;
    statusChallenge: string;
    metrik: any[];
    peserta: any[];
    leaderBoard: any[];
    ketentuanHadiah: any[];
    hadiahPemenang: any[];
    bannerSearch: any[];
    popUp: any[];
    notifikasiPush: any[];
}
