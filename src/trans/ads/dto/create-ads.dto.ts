import { ObjectId } from "mongoose";

export class CreateAdsDto {


    _id: { oid: String; };
    userID: { oid: String; };
    userIDAssesment: { oid: String; };
    demografisID: {
        $ref: String;
        $id: { oid: String };
        $db: String;
    };
    interestID: any[];
    typeAdsID: { oid: String; };
    placingID: { oid: String; };
    description: string;
    expiredAt: string;
    gender: string;
    liveAt: string;
    name: string;
    objectifitas: string;
    status: string;
    timestamp: string;
    totalClick: number;
    totalUsedCredit: number;
    totalView: number;
    urlLink: string;
    userVoucherID: any[];
    isActive: boolean;
    type: string;
    mediaAds: { oid: String; };
    tayang: number;
    endAge: number;
    startAge: number;
    usedCredit: number;
    usedCreditFree: number;
    creditFree: number;
    creditValue: number;
    totalCredit: number;
    liveTypeAds: boolean;
}

export class MediaimageadsDto {

    // readonly _id: String;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    fsSourceName: string;
    fsSourceUri: string;
    fsTargetUri: string;
    mediaBasePath: string;
    mediaMime: string;
    mediaType: string;
    mediaUri: string;
    originalName: string;
}

export class MediavodeosadsDto {

    // readonly _id: String;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    fsSourceName: string;
    fsSourceUri: string;
    fsTargetThumbUri: string;
    fsTargetUri: string;
    mediaBasePath: string;
    mediaMime: string;
    mediaThumb: string;
    mediaType: string;
    mediaUri: string;
    originalName: string;
    rotate: number;
}