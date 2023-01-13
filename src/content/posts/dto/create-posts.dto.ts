import { Long } from "mongodb";
import mongoose from "mongoose";

export class CreatePostsDto {
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
    readonly tags: [];
    readonly allowComments: boolean;
    readonly isSafe: boolean;
    readonly isOwned: boolean;
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
    moderationReason: string[];
}

export class CreatePostResponse {
    response_code: number;
    messages: Messages;
    data: PostData;
}

export class Metadata {
    postType: string;
    duration: number;
    postID: string;
    email: string;
    postRoll: number;
    midRoll: number;
    preRoll: number;
    width: Number;
    height: Number;
}

export class Cat {
    _id: string;
    interestName: string;
    langIso: string;
    icon: string;
    createdAt: string;
    updatedAt: string;
}

export class Avatar {
    mediaBasePath: string;
    mediaUri: string;
    mediaType: string;
    mediaEndpoint: string;
}

export class Privacy {
    isPostPrivate: boolean;
    isCelebrity: boolean;
    isPrivate: boolean;
}

export class TagPeople {
    avatar: Avatar;
    email: string;
    username: string;
    status: string;
}

export class PostData {
    rotate: number;
    metadata: Metadata;
    description: string;
    postID: string;
    title: string;
    createdAt: string;
    certified: boolean;
    saleLike: boolean;
    email: string;
    updatedAt: string;
    saleAmount?: any;
    visibility: string;
    mediaBasePath?: any;
    postType: string;
    isApsara: boolean;
    mediaUri?: any;
    active: boolean;
    mediaType: string;
    saleView: boolean;
    mediaThumbEndpoint: string;
    tags: string[];
    allowComments: boolean;
    cats: Cat[];
    tagPeople: TagPeople[];
    mediaThumbUri?: any;
    location?: any;
    mediaEndpoint: string;
    privacy?: Privacy;
    username: string;
    apsaraId: string;
    apsaraThumbId: string;
    insight: InsightPost;
    isViewed: boolean;
    isLiked: boolean;
    avatar: Avatar;
    boostViewer: any[];
    musicId: mongoose.Types.ObjectId;
    boosted: any[];
    boostCount: number;
    isBoost: number;
    boostJangkauan: number;
    statusBoost: string;
    music: any;
    apsaraMusic: string;
    apsaraThumnail: string;
    reportedStatus: string;
    reportedUserCount: number;



}

export class Messages {
    info: string[];
}

export class PostResponseApps {
    response_code: number;
    data: PostData[];
    messages: Messages;
    version: string;
}

export class VideoList {
    Status: string;
    VideoId: string;
    Size: number;
    DownloadSwitch: string;
    Title: string;
    Duration: number;
    ModificationTime: Date;
    CateId: number;
    CateName: string;
    PreprocessStatus: string;
    AppId: string;
    CreationTime: Date;
    CoverURL: string;
    RegionId: string;
    StorageLocation: string;
    Snapshots: string[];
    TemplateGroupId: string;
}

export class ApsaraVideoResponse {
    RequestId: string;
    VideoList: VideoList[];
}

export class Mezzanine {
    FileURL: string;
    OriginalFileName: string;
    Height: number;
    Width: number;
    FileSize: number;
}

export class ImageInfo {
    Status: string;
    Mezzanine: Mezzanine;
    CreationTime: Date;
    ImageId: string;
    Title: string;
    RegionId: string;
    StorageLocation: string;
    URL: string;
    ImageType: string;
}

export class ApsaraImageResponse {
    RequestId: string;
    NonExistImageIds: any[];
    ImageInfo: ImageInfo[];
}

export class ApsaraPlayResponse {
    PlayUrl: string;
    Duration: string;
}

export class InsightPost {
    follower: number;
    following: number;
    likes: number;
    views: number;
    shares: number;
    comments: number;
    reactions: number;
}

export class PostLandingData {
    video: PostData[];
    pict: PostData[];
    story: PostData[];
    diary: PostData[];
}

export class PostLandingResponseApps {
    response_code: number;
    data: PostLandingData;
    messages: Messages;
    version: string;
}

export class PostBuildData {
    vids: string[];
    picts: string[];
    user: string[];
    interest: string[];
}