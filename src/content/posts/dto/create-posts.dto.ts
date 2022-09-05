import { Long } from "mongodb";

export class CreatePostsDto {
  

    readonly _id: String;
    readonly postID: String;
    readonly email: String;
    readonly postType: String;
    readonly description: String;
    readonly active: boolean;
    readonly  createdAt: String;
    readonly  updatedAt: String;
    readonly expiration: Long;
    readonly  visibility: String;
    readonly  location: String;
    readonly  tags: [];
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
        db:String;
    };
   
   
    readonly contentMedias: any[];
    readonly _class:String;
  }

  export class CreatePostResponse {
    response_code: number;
    messages: String;
    data: any;
  }  

  export class Metadata {
    postType: string;
    duration: number;
    postID: string;
    email: string;
    postRoll: number;
    midRoll: number;
    preRoll: number;
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