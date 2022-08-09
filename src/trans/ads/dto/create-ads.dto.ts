import { ObjectId } from "mongoose";

export class CreateAdsDto {


    readonly _id: { oid: String; };
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

}