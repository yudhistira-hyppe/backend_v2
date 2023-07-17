export class CreateAdstypesDto {


    readonly _id: { oid: String; };
    nameType: string;
    rewards: number;
    durationMax: number;
    durationMin: number;
    descType: string;

    CPV: number;
    CPA: number;
    skipMax: number;
    skipMin: number;

    mediaType: string;
    sizeType: [];
    formatType: [];
    sizeMax: number;

    titleMax: number;
    descriptionMax: number;
    distanceArea: number;
    intervalAds: number;
    conterImpression: number;
    servingMultiplier: number;

    creditValue: number;
    AdsSkip: number;

}