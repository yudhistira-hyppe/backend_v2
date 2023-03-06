import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { TagCountDto } from './dto/create-tag_count.dto';
import { TagCount, TagCountDocument } from './schemas/tag_count.schema';

@Injectable()
export class TagCountService {
    constructor(
        @InjectModel(TagCount.name, 'SERVER_FULL')
        private readonly tagcountModel: Model<TagCountDocument>,
    ) { }

    async create(
        TagCountDto: TagCountDto,
    ): Promise<TagCount> {
        const tagCountDto = await this.tagcountModel.create(
            TagCountDto,
        );
        return tagCountDto;
    }

    async findAll(): Promise<TagCount[]> {
        return this.tagcountModel.find().exec();
    }

    async findOneById(id: string): Promise<TagCount> {
        return this.tagcountModel
            .findOne({ _id: id })
            .exec();
    }

    async update(
        id: string,
        tagCountDto: TagCountDto,
    ): Promise<TagCount> {
        let data = await this.tagcountModel.findByIdAndUpdate(
            id,
            tagCountDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async detailsearchcontenNew(key: string, email: string, skip: number, limit: number, pict: any, vid: any, diary: any) {


        var pipeline = [];

        pipeline.push({
            $match: {
                "_id": key
            }
        },
            {
                $lookup: {
                    from: "posts",
                    let: {
                        localID: "$listdata.postID"
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $in: ['$postID', '$$localID']
                                        }
                                    },
                                    {
                                        "reportedStatus": {
                                            $ne: "OWNED"
                                        }
                                    },
                                    {
                                        "visibility": "PUBLIC"
                                    },
                                    {
                                        "active": true
                                    },
                                    {
                                        "reportedUser.email": {
                                            $not: {
                                                $regex: email
                                            }
                                        }
                                    },

                                ]
                            },

                        },
                        {
                            $project: {
                                "boosted":
                                {
                                    $cond: {
                                        if: {
                                            $gt: [{
                                                "$dateToString": {
                                                    "format": "%Y-%m-%d %H:%M:%S",
                                                    "date": {
                                                        $add: [new Date(), 25200000]
                                                    }
                                                }
                                            }, "$boosted.boostSession.timeEnd"]
                                        },
                                        then: [],
                                        else: '$boosted'
                                    }
                                },
                                "reportedStatus": 1,
                                "insight": {
                                    "shares": "$shares",
                                    "comments": "$comments",
                                    "views": "$views",
                                    "likes": "$likes",

                                },
                                "comments": "$comments",
                                "likes": "$likes",
                                "scorePict": 1,
                                "_id": 1,
                                "postID": 1,
                                "createdAt": 1,
                                "updatedAt": 1,
                                "email": 1,
                                "postType": 1,
                                "description": 1,
                                "active": 1,
                                "metadata": 1,
                                "location": 1,
                                "isOwned": 1,
                                "visibility": 1,
                                "isViewed": 1,
                                "allowComments": 1,
                                "saleAmount": 1,
                                "isLiked": 1,

                            }
                        }
                    ],
                    as: "posted"
                },

            },);

        if (pict === true && vid === false && diary === false) {
            pipeline.push(

                {
                    $facet:
                    {
                        "tag":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        total: "$total",
                                    }
                                }
                            ],
                        "pict":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "pict"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediapicts",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.postID",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $arrayElemAt: ['$media.apsara', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                    }
                                },
                                {
                                    $sort: {
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,

                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],
                    },

                },
            );
        }

        else if (pict === false && vid === true && diary === false) {
            pipeline.push(

                {
                    $facet:
                    {
                        "tag":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        total: "$total",
                                    }
                                }
                            ],
                        "vid":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "vid"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediavideos",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.postID",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $arrayElemAt: ['$media.apsara', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                    }
                                },
                                {
                                    $sort: {
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,

                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],
                    },

                },
            );
        }
        else if (pict === false && vid === false && diary === true) {
            pipeline.push(

                {
                    $facet:
                    {
                        "tag":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        total: "$total",
                                    }
                                }
                            ],
                        "diary":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "diary"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediadiaries",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.postID",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $arrayElemAt: ['$media.apsara', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                    }
                                },
                                {
                                    $sort: {
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,

                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],
                    },

                },
            );
        }
        else if (pict === true && vid === false && diary === true) {
            pipeline.push(

                {
                    $facet:
                    {
                        "tag":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        total: "$total",
                                    }
                                }
                            ],
                        "pict":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "pict"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediapicts",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.postID",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $arrayElemAt: ['$media.apsara', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                    }
                                },
                                {
                                    $sort: {
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,

                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],
                        "diary":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "diary"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediadiaries",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.postID",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $arrayElemAt: ['$media.apsara', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                    }
                                },
                                {
                                    $sort: {
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,

                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],
                    },

                },
            );
        }
        else if (pict === true && vid === true && diary === true) {
            pipeline.push(

                {
                    $facet:
                    {
                        "tag":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        total: "$total",
                                    }
                                }
                            ],
                        "pict":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "pict"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediapicts",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.postID",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $arrayElemAt: ['$media.apsara', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                    }
                                },
                                {
                                    $sort: {
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,

                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],
                        "vid":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "vid"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediavideos",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.postID",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $arrayElemAt: ['$media.apsara', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                    }
                                },
                                {
                                    $sort: {
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,

                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],
                        "diary":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "diary"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediadiaries",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.postID",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $arrayElemAt: ['$media.apsara', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                    }
                                },
                                {
                                    $sort: {
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,

                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],
                    },

                },
            );
        }
        else if (pict === false && vid === true && diary === true) {
            pipeline.push(

                {
                    $facet:
                    {
                        "tag":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        total: "$total",
                                    }
                                }
                            ],

                        "vid":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "vid"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediavideos",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.postID",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $arrayElemAt: ['$media.apsara', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                    }
                                },
                                {
                                    $sort: {
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,

                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],
                        "diary":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "diary"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediadiaries",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.postID",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $arrayElemAt: ['$media.apsara', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                    }
                                },
                                {
                                    $sort: {
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,

                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],
                    },

                },
            );
        }
        else if (pict === true && vid === true && diary === false) {
            pipeline.push(

                {
                    $facet:
                    {
                        "tag":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        total: "$total",
                                    }
                                }
                            ],
                        "pict":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "pict"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediapicts",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.postID",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $arrayElemAt: ['$media.apsara', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                    }
                                },
                                {
                                    $sort: {
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,

                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],
                        "vid":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "vid"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediavideos",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.postID",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $arrayElemAt: ['$media.apsara', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                    }
                                },
                                {
                                    $sort: {
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,

                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],

                    },

                },
            );
        }


        const query = await this.tagcountModel.aggregate(pipeline);
        return query;
    }

}
