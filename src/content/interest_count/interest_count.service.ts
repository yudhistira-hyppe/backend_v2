import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { InterestCountDto } from './dto/create-interest_count.dto';
import { InterestCount, InterestCountDocument } from './schemas/interest_count.schema';

@Injectable()
export class InterestCountService {
    constructor(
        @InjectModel(InterestCount.name, 'SERVER_FULL')
        private readonly interestCountModel: Model<InterestCountDocument>,
    ) { }

    async create(
        InterestCountDto: InterestCountDto,
    ): Promise<InterestCount> {
        const interestCountDto = await this.interestCountModel.create(
            InterestCountDto,
        );
        return interestCountDto;
    }

    async findAll(): Promise<InterestCount[]> {
        return this.interestCountModel.find().exec();
    }

    async findOneById(id: string): Promise<InterestCount> {
        return this.interestCountModel
            .findOne({ _id: new Types.ObjectId(id) })
            .exec();
    }

    async update(
        id: string,
        tagCountDto: InterestCountDto,
    ): Promise<InterestCount> {
        let data = await this.interestCountModel.findByIdAndUpdate(
            id,
            tagCountDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async searchDefaultPage(page: number, limits: number) {
        var pipeline = [];
        var pipelinetag = [];
        var pipelineinterest = [];

        pipelinetag.push({
            $project: {
                tag: "$_id",
                total: 1,
            }
        },
            {
                $sort: {
                    total: - 1
                }
            });

        if (page > 0) {
            pipelinetag.push({
                "$skip": limits * page
            });
        }

        if (limits > 0) {
            pipelinetag.push({
                "$limit": limits
            });

            pipelineinterest.push({
                "$limit": limits
            });
        }

        pipelinetag.push({
            $project: {
                total: "$total",
                nama: "$_id",
            }
        });

        pipelineinterest.push(
            {
                $sort: {
                    total: - 1
                }
            },
            {
                $lookup:
                {
                    from: "interests_repo",
                    localField: "_id",
                    foreignField: "_id",
                    as: "interest"
                }
            },
            {
                $unwind: {
                    path: "$interest"
                }
            },
            {
                $project: {
                    interests: "$interestName",
                    interestName: "$interest.interestName",
                    langIso: "$interest.langIso",
                    icon: "$interest.icon",
                    createdAt: "$interest.createdAt",
                    updatedAt: "$interest.updatedAt",
                    interestNameId: "$interest.interestNameId",
                    thumbnail: "$interest.thumbnail",
                    total: "$total"
                }
            }
        );

        pipeline.push(
            {
                "$limit": 1
            },
            {
                $facet:
                {
                    tag:
                        [
                            {
                                $lookup: {
                                    from: "tag_count",
                                    pipeline: pipelinetag,
                                    as: "tag"
                                },
                            },
                        ],
                    interest: [
                        {
                            $lookup: {
                                from: "interest_count",
                                pipeline: pipelineinterest,
                                as: "interest"
                            }
                        }
                    ]
                }
            },
            {
                $unwind:
                {
                    path: "$tag"
                }
            },
            {
                $unwind:
                {
                    path: "$interest"
                }
            },
            {
                $project:
                {
                    tag: "$tag.tag",
                    interest: "$interest.interest"
                }
            }
        );


        // console.log(JSON.stringify(pipeline));
        var query = await this.interestCountModel.aggregate(pipeline);

        return query;
    }

    async detailinterestcontenNew(key: string, email: string, skip: number, limit: number, pict: any, vid: any, diary: any) {


        var pipeline = [];

        pipeline.push({
            $match: {
                "_id": new Types.ObjectId(key)
            }
        },
            {
                $lookup:
                {
                    from: "interests_repo",
                    localField: "_id",
                    foreignField: "_id",
                    as: "interest"
                }
            },
            {
                $unwind: {
                    path: "$interest"
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
                        "interest":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        interestNameId: "$interest.interestNameId",
                                        interestNameEn: "$interest.interestName",
                                        total: "$total",

                                    }
                                }
                            ],
                        //pict
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
                                        "email": "$pict.email",
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
                                        createdAt: -1
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
                        "interest":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        interestNameId: "$interest.interestNameId",
                                        interestNameEn: "$interest.interestName",
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
                                        "email": "$pict.email",
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
                                        createdAt: -1
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
                        "interest":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        interestNameId: "$interest.interestNameId",
                                        interestNameEn: "$interest.interestName",
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
                                        "email": "$pict.email",
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
                                        createdAt: -1
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
                        "interest":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        interestNameId: "$interest.interestNameId",
                                        interestNameEn: "$interest.interestName",
                                        total: "$total",

                                    }
                                }
                            ],
                        //pict
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
                                        "email": "$pict.email",
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
                                        createdAt: -1
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
                                        "email": "$pict.email",
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
                                        createdAt: -1
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
                        "interest":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        interestNameId: "$interest.interestNameId",
                                        interestNameEn: "$interest.interestName",
                                        total: "$total",

                                    }
                                }
                            ],
                        //pict
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
                                        "email": "$pict.email",
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
                                        createdAt: -1
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
                                        "email": "$pict.email",
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
                                        createdAt: -1
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
                        "interest":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        interestNameId: "$interest.interestNameId",
                                        interestNameEn: "$interest.interestName",
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
                                        "email": "$pict.email",
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
                                        createdAt: -1
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
                                        "email": "$pict.email",
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
                                        createdAt: -1
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
                        "interest":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        interestNameId: "$interest.interestNameId",
                                        interestNameEn: "$interest.interestName",
                                        total: "$total",

                                    }
                                }
                            ],
                        //pict
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
                                        "email": "$pict.email",
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
                                        createdAt: -1
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
                                        "email": "$pict.email",
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
                                        createdAt: -1
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
                                        "email": "$pict.email",
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
                                        createdAt: -1
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


        const query = await this.interestCountModel.aggregate(pipeline);
        return query;
    }

}
