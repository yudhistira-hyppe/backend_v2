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
    metrik: any[];
    tipeAkun: any[];
    rentangUmur: any[];
    jenisKelamin: any[];
    lokasiPengguna: any[];
    caraGabung: string;
    leaderBoard: any[];
    ketentuanHadiah: any[];
    hadiahPemenang: any[];
    bannerSearch: any[];
    popUp: any[];
    notifikasiPush: any[];
}
