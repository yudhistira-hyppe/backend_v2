import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId, Types } from 'mongoose';
import { Userbadge, UserbadgeDocument } from './schemas/userbadge.schema';

@Injectable()
export class UserbadgeService {

    constructor(
        @InjectModel(Userbadge.name, 'SERVER_FULL')
        private readonly UserbadgeModel: Model<UserbadgeDocument>,
    ) { }

    async create(Userbadge_: Userbadge): Promise<Userbadge> {
        const _Userbadge_ = this.UserbadgeModel.create(Userbadge_);
        return _Userbadge_;
    }

    async findOne(id: string): Promise<Userbadge> {
        return this.UserbadgeModel.findOne({ _id: new Types.ObjectId(id) }).exec();
    }

    async find(): Promise<Userbadge[]> {
        return this.UserbadgeModel.find().exec();
    }

    async update(id: string, Userbadge_: Userbadge): Promise<Userbadge> {
        let data = await this.UserbadgeModel.findByIdAndUpdate(id, Userbadge_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }
    async updateNonactive(id: string): Promise<Object> {
        let data = await this.UserbadgeModel.updateOne({ "_id": id },
            {
                $set: {
                    "isActive": false,

                }
            });
        return data;
    }
    async getUserbadge(iduser: string, idsubchallenge: string) {
        var query = await this.UserbadgeModel.aggregate(
            [

                {
                    $match: {
                        "userId": new Types.ObjectId(iduser),
                        "SubChallengeId": new Types.ObjectId(idsubchallenge),
                    }
                }
            ]
        );
        return query[0];

    }

    async getUserbadgeExpired() {
        var query = await this.UserbadgeModel.aggregate(
            [

                {
                    $set: {
                        "timenow":
                        {
                            "$dateToString": {
                                "format": "%Y-%m-%d %H:%M:%S",
                                "date": {
                                    $add: [
                                        new Date(),
                                        25200000
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$match":
                    {
                        "$and":
                            [

                                {
                                    $expr:
                                    {
                                        $gte:
                                            [
                                                "$timenow",
                                                "$endDatetime",

                                            ]
                                    },

                                },
                                {
                                    $expr:
                                    {
                                        $eq:
                                            [
                                                "$isActive", true

                                            ]
                                    },

                                },

                            ]
                    }
                },
            ]
        );
        return query;

    }

    async getBadgeByuser(iduser: string, page: number, limit: number) {
        var pipeline = [];

        pipeline.push({
            $match: {
                "userId": new Types.ObjectId(iduser),

            }
        },
            {
                $lookup: {
                    from: 'userbasics',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'basicdata',

                }
            },
            {
                $addFields: {

                    'profilepictid': {
                        $arrayElemAt: ['$basicdata.profilePict.$id', 0]
                    },

                }
            },
            {
                $lookup: {
                    from: 'mediaprofilepicts',
                    localField: 'profilepictid',
                    foreignField: '_id',
                    as: 'avatardata',

                }
            },
            {
                $lookup: {
                    from: 'badge',
                    localField: 'idBadge',
                    foreignField: '_id',
                    as: 'badge_data',

                },

            },
            {
                "$lookup": {
                    "from": "subChallenge",
                    "as": "subChallenge_data",
                    "let": {
                        "local_id": "$SubChallengeId",

                    },
                    "pipeline": [
                        {
                            $match:
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $eq: ['$_id', '$$local_id']
                                        }
                                    },

                                ]
                            }
                        },
                        {
                            $project: {
                                "challengeId": 1,
                                "startDatetime": 1,
                                "endDatetime": 1,
                                "isActive": 1,
                                "session": 1,

                            }
                        },
                        {
                            $lookup: {
                                from: 'challenge',
                                localField: 'challengeId',
                                foreignField: '_id',
                                as: 'challenge_data',

                            },

                        },
                        {
                            $project: {
                                "challengeId": 1,
                                "startDatetime": 1,
                                "endDatetime": 1,
                                "isActive": 1,
                                "session": 1,
                                "nameChallenge": {
                                    "$arrayElemAt":
                                        [
                                            "$challenge_data.nameChallenge",
                                            0
                                        ]
                                },

                            }
                        },

                    ],

                },

            },
            {
                $project: {

                    "SubChallengeId": 1,
                    "userId": 1,
                    "idBadge": 1,
                    "session": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "createdAt": 1,
                    "isActive": 1,
                    "avatar": {
                        $arrayElemAt: ['$avatardata', 0]
                    },
                    "badge_data": 1,
                    "subChallenge_data": 1
                }
            },
            {
                $project: {

                    "SubChallengeId": 1,
                    "userId": 1,
                    "idBadge": 1,
                    "session": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "createdAt": 1,
                    "isActive": 1,
                    avatar: {

                        mediaEndpoint: {
                            "$concat": ["/profilepict/", '$avatar.mediaID']
                        },

                    },
                    "badge_data": 1,
                    "subChallenge_data": 1
                }

            },
            {
                $sort: { "createdAt": -1 }
            });

        if (page > 0) {
            pipeline.push({ $skip: (page * limit) });
        }
        if (limit > 0) {
            pipeline.push({ $limit: limit });
        }
        var query = await this.UserbadgeModel.aggregate(pipeline);
        return query;
    }

    async getBadgeUserCollection(iduser: string, page: number, limit: number) {
        var pipeline = [];

        pipeline.push({
            $match: {
                "userId": new Types.ObjectId(iduser),

            }
        },
            {
                $lookup: {
                    from: 'userbasics',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'basicdata',

                }
            },
            {
                $addFields: {

                    'profilepictid': {
                        $arrayElemAt: ['$basicdata.profilePict.$id', 0]
                    },

                }
            },
            {
                $lookup: {
                    from: 'mediaprofilepicts',
                    localField: 'profilepictid',
                    foreignField: '_id',
                    as: 'avatardata',

                }
            },
            {
                $facet: {
                    user: [
                        {
                            $project: {
                                "avatar": {
                                    $arrayElemAt: ['$avatardata', 0]
                                },

                            }
                        }
                    ],
                    badgeAktif: [
                        {
                            $match: {
                                "isActive": true,

                            }
                        },
                        {
                            $lookup: {
                                from: 'badge',
                                localField: 'idBadge',
                                foreignField: '_id',
                                as: 'badge_data',

                            },

                        },
                        {
                            "$lookup": {
                                "from": "subChallenge",
                                "as": "subChallenge_data",
                                "let": {
                                    "local_id": "$SubChallengeId",

                                },
                                "pipeline": [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$_id', '$$local_id']
                                                    }
                                                },

                                            ]
                                        }
                                    },
                                    {
                                        $project: {
                                            "challengeId": 1,
                                            "startDatetime": 1,
                                            "endDatetime": 1,
                                            "isActive": 1,
                                            "session": 1,

                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: 'challenge',
                                            localField: 'challengeId',
                                            foreignField: '_id',
                                            as: 'challenge_data',

                                        },

                                    },
                                    {
                                        $project: {
                                            "challengeId": 1,
                                            "startDatetime": 1,
                                            "endDatetime": 1,
                                            "isActive": 1,
                                            "session": 1,
                                            "nameChallenge": {
                                                "$arrayElemAt":
                                                    [
                                                        "$challenge_data.nameChallenge",
                                                        0
                                                    ]
                                            },

                                        }
                                    },

                                ],

                            },

                        },
                        {
                            $project: {

                                "SubChallengeId": 1,
                                "userId": 1,
                                "idBadge": 1,
                                "session": 1,
                                "startDatetime": 1,
                                "endDatetime": 1,
                                "createdAt": 1,
                                "isActive": 1,
                                "badge_data": 1,
                                "subChallenge_data": 1
                            }
                        },
                        {
                            $project: {

                                "SubChallengeId": 1,
                                "userId": 1,
                                "idBadge": 1,
                                "session": 1,
                                "startDatetime": 1,
                                "endDatetime": 1,
                                "createdAt": 1,
                                "isActive": 1,
                                "badge_data": 1,
                                "subChallenge_data": 1
                            }
                        },
                        {
                            $sort: {
                                "createdAt": - 1
                            }
                        },

                    ],
                    badgeNonAktif: [
                        {
                            $match: {
                                "isActive": false,

                            }
                        },
                        {
                            $lookup: {
                                from: 'badge',
                                localField: 'idBadge',
                                foreignField: '_id',
                                as: 'badge_data',

                            },

                        },
                        {
                            "$lookup": {
                                "from": "subChallenge",
                                "as": "subChallenge_data",
                                "let": {
                                    "local_id": "$SubChallengeId",

                                },
                                "pipeline": [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$_id', '$$local_id']
                                                    }
                                                },

                                            ]
                                        }
                                    },
                                    {
                                        $project: {
                                            "challengeId": 1,
                                            "startDatetime": 1,
                                            "endDatetime": 1,
                                            "isActive": 1,
                                            "session": 1,

                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: 'challenge',
                                            localField: 'challengeId',
                                            foreignField: '_id',
                                            as: 'challenge_data',

                                        },

                                    },
                                    {
                                        $project: {
                                            "challengeId": 1,
                                            "startDatetime": 1,
                                            "endDatetime": 1,
                                            "isActive": 1,
                                            "session": 1,
                                            "nameChallenge": {
                                                "$arrayElemAt":
                                                    [
                                                        "$challenge_data.nameChallenge",
                                                        0
                                                    ]
                                            },

                                        }
                                    },

                                ],

                            },

                        },
                        {
                            $project: {

                                "SubChallengeId": 1,
                                "userId": 1,
                                "idBadge": 1,
                                "session": 1,
                                "startDatetime": 1,
                                "endDatetime": 1,
                                "createdAt": 1,
                                "isActive": 1,
                                "avatar": {
                                    $arrayElemAt: ['$avatardata', 0]
                                },
                                "badge_data": 1,
                                "subChallenge_data": 1
                            }
                        },
                        {
                            $project: {

                                "SubChallengeId": 1,
                                "userId": 1,
                                "idBadge": 1,
                                "session": 1,
                                "startDatetime": 1,
                                "endDatetime": 1,
                                "createdAt": 1,
                                "isActive": 1,
                                "badge_data": 1,
                                "subChallenge_data": 1
                            }
                        },
                        {
                            $sort: {
                                "createdAt": - 1
                            }
                        },
                        { $skip: (page * limit) },
                        {
                            $limit: limit,

                        }
                    ]
                }
            },

            {
                $project: {
                    user: {
                        $arrayElemAt: ['$user.avatar', 0]
                    },

                    badgeAktif: 1,
                    badgeNonAktif: 1
                }
            },
            {
                $project: {

                    avatar: {

                        mediaEndpoint: {
                            "$concat": ["/profilepict/", '$user.mediaID']
                        },

                    },
                    badgeAktif: 1,
                    badgeNonAktif: 1
                }
            },);

        var query = await this.UserbadgeModel.aggregate(pipeline);
        return query;
    }

    async getBadgeUserCollectionV2(iduser: string, page: number, limit: number) {
        var pipeline = [];

        pipeline.push({
            $match: {
                "userId": new Types.ObjectId(iduser),

            }
        },
            {
                $lookup: {
                    from: 'newUserBasics',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'basicdata',

                }
            },
            // {
            //     $addFields: {

            //         'profilepictid': {
            //             $arrayElemAt: ['$basicdata.profilePict.$id', 0]
            //         },

            //     }
            // },
            // {
            //     $lookup: {
            //         from: 'mediaprofilepicts',
            //         localField: 'profilepictid',
            //         foreignField: '_id',
            //         as: 'avatardata',

            //     }
            // },
            {
                $facet: {
                    user: [
                        {
                            $project: {
                                "avatar": {
                                    $arrayElemAt: ['$basicdata.mediaEndpoint', 0]
                                }

                            }
                        }
                    ],
                    badgeAktif: [
                        {
                            $match: {
                                "isActive": true,

                            }
                        },
                        {
                            $lookup: {
                                from: 'badge',
                                localField: 'idBadge',
                                foreignField: '_id',
                                as: 'badge_data',

                            },

                        },
                        {
                            "$lookup": {
                                "from": "subChallenge",
                                "as": "subChallenge_data",
                                "let": {
                                    "local_id": "$SubChallengeId",

                                },
                                "pipeline": [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$_id', '$$local_id']
                                                    }
                                                },

                                            ]
                                        }
                                    },
                                    {
                                        $project: {
                                            "challengeId": 1,
                                            "startDatetime": 1,
                                            "endDatetime": 1,
                                            "isActive": 1,
                                            "session": 1,

                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: 'challenge',
                                            localField: 'challengeId',
                                            foreignField: '_id',
                                            as: 'challenge_data',

                                        },

                                    },
                                    {
                                        $project: {
                                            "challengeId": 1,
                                            "startDatetime": 1,
                                            "endDatetime": 1,
                                            "isActive": 1,
                                            "session": 1,
                                            "nameChallenge": {
                                                "$arrayElemAt":
                                                    [
                                                        "$challenge_data.nameChallenge",
                                                        0
                                                    ]
                                            },

                                        }
                                    },

                                ],

                            },

                        },
                        // {
                        //     $project: {

                        //         "SubChallengeId": 1,
                        //         "userId": 1,
                        //         "idBadge": 1,
                        //         "session": 1,
                        //         "startDatetime": 1,
                        //         "endDatetime": 1,
                        //         "createdAt": 1,
                        //         "isActive": 1,
                        //         "badge_data": 1,
                        //         "subChallenge_data": 1
                        //     }
                        // },
                        {
                            $project: {

                                "SubChallengeId": 1,
                                "userId": 1,
                                "idBadge": 1,
                                "session": 1,
                                "startDatetime": 1,
                                "endDatetime": 1,
                                "createdAt": 1,
                                "isActive": 1,
                                "badge_data": 1,
                                "subChallenge_data": 1
                            }
                        },
                        {
                            $sort: {
                                "createdAt": - 1
                            }
                        },

                    ],
                    badgeNonAktif: [
                        {
                            $match: {
                                "isActive": false,

                            }
                        },
                        {
                            $lookup: {
                                from: 'badge',
                                localField: 'idBadge',
                                foreignField: '_id',
                                as: 'badge_data',

                            },

                        },
                        {
                            "$lookup": {
                                "from": "subChallenge",
                                "as": "subChallenge_data",
                                "let": {
                                    "local_id": "$SubChallengeId",

                                },
                                "pipeline": [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$_id', '$$local_id']
                                                    }
                                                },

                                            ]
                                        }
                                    },
                                    {
                                        $project: {
                                            "challengeId": 1,
                                            "startDatetime": 1,
                                            "endDatetime": 1,
                                            "isActive": 1,
                                            "session": 1,

                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: 'challenge',
                                            localField: 'challengeId',
                                            foreignField: '_id',
                                            as: 'challenge_data',

                                        },

                                    },
                                    {
                                        $project: {
                                            "challengeId": 1,
                                            "startDatetime": 1,
                                            "endDatetime": 1,
                                            "isActive": 1,
                                            "session": 1,
                                            "nameChallenge": {
                                                "$arrayElemAt":
                                                    [
                                                        "$challenge_data.nameChallenge",
                                                        0
                                                    ]
                                            },

                                        }
                                    },

                                ],

                            },

                        },
                        // {
                        //     $project: {

                        //         "SubChallengeId": 1,
                        //         "userId": 1,
                        //         "idBadge": 1,
                        //         "session": 1,
                        //         "startDatetime": 1,
                        //         "endDatetime": 1,
                        //         "createdAt": 1,
                        //         "isActive": 1,
                        //         "avatar": "$basicdata.mediaEndpoint",
                        //         "badge_data": 1,
                        //         "subChallenge_data": 1
                        //     }
                        // },
                        {
                            $project: {

                                "SubChallengeId": 1,
                                "userId": 1,
                                "idBadge": 1,
                                "session": 1,
                                "startDatetime": 1,
                                "endDatetime": 1,
                                "createdAt": 1,
                                "isActive": 1,
                                "badge_data": 1,
                                "subChallenge_data": 1
                            }
                        },
                        {
                            $sort: {
                                "createdAt": - 1
                            }
                        },
                        { $skip: (page * limit) },
                        {
                            $limit: limit,

                        }
                    ]
                }
            },

            // {
            //     $project: {
            //         user: {
            //             $arrayElemAt: ['$user.avatar', 0]
            //         },

            //         badgeAktif: 1,
            //         badgeNonAktif: 1
            //     }
            // },
            {
                $project: {

                    avatar: {

                        mediaEndpoint: {
                            $arrayElemAt: ['$user.avatar', 0]
                        },

                    },
                    badgeAktif: 1,
                    badgeNonAktif: 1
                }
            },);

        var query = await this.UserbadgeModel.aggregate(pipeline);
        return query;
    }

    async getBadgeIduserbadge(id: string) {
        var pipeline = [];

        pipeline.push({
            $match: {
                "_id": new Types.ObjectId(id),

            }
        },
            {
                $lookup: {
                    from: 'userbasics',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'basicdata',

                }
            },
            {
                $addFields: {

                    'profilepictid': {
                        $arrayElemAt: ['$basicdata.profilePict.$id', 0]
                    },

                }
            },
            {
                $lookup: {
                    from: 'mediaprofilepicts',
                    localField: 'profilepictid',
                    foreignField: '_id',
                    as: 'avatardata',

                }
            },
            {
                $lookup: {
                    from: 'badge',
                    localField: 'idBadge',
                    foreignField: '_id',
                    as: 'badge_data',

                },

            },
            {
                "$lookup": {
                    "from": "subChallenge",
                    "as": "subChallenge_data",
                    "let": {
                        "local_id": "$SubChallengeId",

                    },
                    "pipeline": [
                        {
                            $match:
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $eq: ['$_id', '$$local_id']
                                        }
                                    },

                                ]
                            }
                        },
                        {
                            $project: {
                                "challengeId": 1,
                                "startDatetime": 1,
                                "endDatetime": 1,
                                "isActive": 1,
                                "session": 1,

                            }
                        },
                        {
                            $lookup: {
                                from: 'challenge',
                                localField: 'challengeId',
                                foreignField: '_id',
                                as: 'challenge_data',

                            },

                        },
                        {
                            $project: {
                                "challengeId": 1,
                                "startDatetime": 1,
                                "endDatetime": 1,
                                "isActive": 1,
                                "session": 1,
                                "nameChallenge": {
                                    "$arrayElemAt":
                                        [
                                            "$challenge_data.nameChallenge",
                                            0
                                        ]
                                },

                            }
                        },

                    ],

                },

            },
            {
                $project: {

                    "SubChallengeId": 1,
                    "userId": 1,
                    "idBadge": 1,
                    "session": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "createdAt": 1,
                    "isActive": 1,
                    "avatar": {
                        $arrayElemAt: ['$avatardata', 0]
                    },
                    "userBadge": {
                        $arrayElemAt: ['$basicdata.userBadge', 0]
                    },
                    "badge_data": 1,
                    "subChallenge_data": 1
                }
            },
            {
                $project: {

                    "SubChallengeId": 1,
                    "userId": 1,
                    "idBadge": 1,
                    "session": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "createdAt": 1,
                    "isActive": 1,
                    avatar: {

                        mediaEndpoint: {
                            "$concat": ["/profilepict/", '$avatar.mediaID']
                        },

                    },
                    "userBadge": 1,
                    "badge_data": 1,
                    "subChallenge_data": 1
                }

            },
        );
        var query = await this.UserbadgeModel.aggregate(pipeline);
        return query;
    }

    async getUserbadgeBasic(id: string) {
        var pipeline = [];

        pipeline.push({
            $match: {
                "userId": new Types.ObjectId(id),

            }
        },
            {
                $lookup: {
                    from: 'userbasics',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'basicdata',

                }
            },
            {
                $addFields: {

                    'profilepictid': {
                        $arrayElemAt: ['$basicdata.profilePict.$id', 0]
                    },

                }
            },
            {
                $lookup: {
                    from: 'mediaprofilepicts',
                    localField: 'profilepictid',
                    foreignField: '_id',
                    as: 'avatardata',

                }
            },
            {
                $lookup: {
                    from: 'badge',
                    localField: 'idBadge',
                    foreignField: '_id',
                    as: 'badge_data',

                },

            },
            {
                "$lookup": {
                    "from": "subChallenge",
                    "as": "subChallenge_data",
                    "let": {
                        "local_id": "$SubChallengeId",

                    },
                    "pipeline": [
                        {
                            $match:
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $eq: ['$_id', '$$local_id']
                                        }
                                    },

                                ]
                            }
                        },
                        {
                            $project: {
                                "challengeId": 1,
                                "startDatetime": 1,
                                "endDatetime": 1,
                                "isActive": 1,
                                "session": 1,

                            }
                        },
                        {
                            $lookup: {
                                from: 'challenge',
                                localField: 'challengeId',
                                foreignField: '_id',
                                as: 'challenge_data',

                            },

                        },
                        {
                            $project: {
                                "challengeId": 1,
                                "startDatetime": 1,
                                "endDatetime": 1,
                                "isActive": 1,
                                "session": 1,
                                "nameChallenge": {
                                    "$arrayElemAt":
                                        [
                                            "$challenge_data.nameChallenge",
                                            0
                                        ]
                                },

                            }
                        },

                    ],

                },

            },
            {
                $project: {

                    "SubChallengeId": 1,
                    "userId": 1,
                    "idBadge": 1,
                    "session": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "createdAt": 1,
                    "isActive": 1,
                    "avatar": {
                        $arrayElemAt: ['$avatardata', 0]
                    },
                    "userBadge": {
                        $arrayElemAt: ['$basicdata.userBadge', 0]
                    },
                    "badge_data": 1,
                    "subChallenge_data": 1
                }
            },
            {
                $project: {

                    "SubChallengeId": 1,
                    "userId": 1,
                    "idBadge": 1,
                    "session": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "createdAt": 1,
                    "isActive": 1,
                    avatar: {

                        mediaEndpoint: {
                            "$concat": ["/profilepict/", '$avatar.mediaID']
                        },

                    },
                    "userBadge": 1,
                    "badge_data": 1,
                    "subChallenge_data": 1
                }

            },
            {
                $unwind: {
                    path: "$userBadge"
                }
            },
            {
                $project: {

                    "SubChallengeId": 1,
                    "userId": 1,
                    "idBadge": 1,
                    "session": 1,
                    "avatar": 1,
                    "idUserBadge": '$_id',
                    "badge_data": 1,
                    "subChallenge_data": 1,
                    "badgeProfile": '$userBadge.badgeProfile',
                    "badgeOther": '$userBadge.badgeOther',
                    "endDatetime": '$userBadge.endDatetime',
                    "isActive": '$userBadge.isActive',
                    "startDatetime": '$userBadge.startDatetime',
                    "createdAt": '$userBadge.createdAt',
                }
            },

        );
        var query = await this.UserbadgeModel.aggregate(pipeline);
        return query;
    }


}
