import { Long } from "mongodb";
import mongoose from "mongoose";

export class CreateNewpostsDto {
    readonly _id: String;
    readonly postID: String;
    readonly email: String;
    readonly postType: String;
    readonly description: String;
    readonly active: boolean;
    readonly createdAt: String;
    readonly updatedAt: String;
    readonly expiration: Long;
    readonly visibility: String;
    readonly location: String;
    readonly tags: any[];
    readonly allowComments: boolean;
    readonly isSafe: boolean;
    readonly isOwned: boolean;
    isShared: boolean;
    readonly metadata: {
        duration: Number;
        postRoll: Number;
        postType: String;
        preRoll: Number;
        midRoll: Number;
        postID: String;
        email: String;
        width: Number;
        height: Number;
    };
    readonly likes: Long;
    readonly views: Long;
    readonly shares: Long;

    readonly comments: Long;
    readonly userProfile: {
        ref: String;
        id: {
            oid: String;
        };
        db: String;
    };
    readonly contentMedias: any[];
    readonly _class: String;
    reportedStatus: string
    reportedUserCount: number
    reportedUser: any[];
    contentModeration: boolean
    contentModerationResponse: string
    contentModerationDate: string
    reportedUserHandle: any[];
    musicId: mongoose.Types.ObjectId;
    boosted: any[];
    boostCount: number;
    isBoost: number;
    moderationReason: string;
    viewer: any[];
}


