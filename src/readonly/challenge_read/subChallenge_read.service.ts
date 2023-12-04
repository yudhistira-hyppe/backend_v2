import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SubChallengeRead, SubChallengeReadDocument } from './schema/subchallenge_read.schema';
import { Model } from 'mongoose';
import mongoose from 'mongoose';

@Injectable()
export class SubChallengeReadService {
    constructor(
        @InjectModel(SubChallengeRead.name, 'SERVER_FULL_READ')
        private readonly subChallengeReadModel: Model<SubChallengeReadDocument>,
    ) { }

    async getListUserChallengekeduaNew2(idchallenge: string, iduser: string, status: string, session: number) {
        var pipeline = [];

        pipeline.push(
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
                    challengeId: new mongoose.Types.ObjectId(idchallenge)
                },

            },
            {
                "$lookup":
                {
                    from: "userChallenge",
                    let:
                    {
                        userchallenge_fk: "$_id"
                    },
                    as: 'getlastrank',
                    pipeline:
                        [
                            {
                                "$match":
                                {
                                    $or:
                                        [
                                            {
                                                "$and":
                                                    [
                                                        {
                                                            "$expr":
                                                            {
                                                                "$eq":
                                                                    [
                                                                        "$$userchallenge_fk",
                                                                        "$idSubChallenge"
                                                                    ]
                                                            }
                                                        },
                                                        {
                                                            isActive: true
                                                        },
                                                        {
                                                            ranking: {
                                                                $ne: 0
                                                            }
                                                        },
                                                        {
                                                            ranking: {
                                                                $ne: null
                                                            }
                                                        },

                                                    ]
                                            },
                                            {
                                                "$and":
                                                    [
                                                        {
                                                            "$expr":
                                                            {
                                                                "$eq":
                                                                    [
                                                                        "$$userchallenge_fk",
                                                                        "$idSubChallenge"
                                                                    ]
                                                            }
                                                        },
                                                        {
                                                            idUser: new mongoose.Types.ObjectId(iduser)
                                                        },
                                                        {
                                                            isActive: true
                                                        },
                                                        {
                                                            ranking: {
                                                                $ne: 0
                                                            }
                                                        },
                                                        {
                                                            ranking: {
                                                                $ne: null
                                                            }
                                                        },

                                                    ]
                                            }
                                        ]
                                }
                            },
                            {
                                $project: {
                                    "_id": 1,
                                    "idSubChallenge": 1,
                                    "idUser": 1,
                                    "ranking": 1,
                                    "score": 1,
                                    "history": 1,
                                    "isUserLogin": 1,
                                    "celeng": 1,
                                    "postChallengess": 1,
                                    "objectChallenge": 1,
                                    "username": 1,
                                    "email": 1,
                                    "avatar": 1,
                                    "currentstatistik": 1,
                                    "winnerBadge": 1,
                                    "winnerBadgeOther": 1,
                                }
                            },
                            {
                                $set: {
                                    userID: new mongoose.Types.ObjectId(iduser)
                                }
                            },
                            {
                                $set: {
                                    isUserLogin:
                                    {
                                        "$cond":
                                        {
                                            if:
                                            {
                                                "$eq":
                                                    ["$userID", "$idUser"]
                                            },
                                            then: true,
                                            else: false
                                        }
                                    },

                                }
                            },
                            {
                                "$sort":
                                {
                                    isUserLogin: - 1,
                                    ranking: 1
                                }
                            },
                            {
                                $limit: 11
                            },
                            {
                                $set: {
                                    lemburTai:
                                    {
                                        $sortArray: { input: "$history", sortBy: { updatedAt: -1 } }
                                    }
                                }
                            },
                            {
                                $set: {
                                    lastRank:
                                    {
                                        $ifNull:
                                            [
                                                //$arrayElemAt: ["$history.ranking", 0] 
                                                {
                                                    $arrayElemAt: ["$lemburTai.ranking", 0]
                                                },
                                                0
                                            ]
                                    }
                                }
                            },


                            {
                                "$lookup":
                                {
                                    from: "userbasics",
                                    let:
                                    {
                                        basic_fk: "$idUser",

                                    },
                                    as: 'userbasic_data',
                                    pipeline:
                                        [
                                            {
                                                "$match":
                                                {
                                                    "$expr":
                                                    {
                                                        "$eq":
                                                            [
                                                                "$_id",
                                                                "$$basic_fk"
                                                            ]
                                                    }
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "userauths",
                                                    let:
                                                    {
                                                        basic_fk: "$email"
                                                    },
                                                    as: 'userauth_data',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$email",
                                                                                            "$$basic_fk"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "challenge",
                                                    let:
                                                    {
                                                        idChallenge: new mongoose.Types.ObjectId(idchallenge)
                                                    },
                                                    as: 'challenge',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$email",
                                                                                            "$$basic_fk"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                "$project":
                                                {
                                                    _id: 1,
                                                    email: 1,
                                                    username:
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$userauth_data.username",
                                                                0
                                                            ]
                                                    },
                                                    avatar:
                                                    {
                                                        mediaEndpoint:
                                                        {
                                                            "$concat":
                                                                [
                                                                    "/profilepict/",
                                                                    "$profilePict.$id",

                                                                ]
                                                        }
                                                    },

                                                }
                                            }
                                        ]
                                }
                            },
                            {
                                "$lookup":
                                {
                                    from: "challenge",
                                    let:
                                    {
                                        idChallenge: new mongoose.Types.ObjectId(idchallenge)
                                    },
                                    as: 'challenges',
                                    pipeline:
                                        [
                                            {
                                                "$match":
                                                {
                                                    "$and":
                                                        [
                                                            {
                                                                "$expr":
                                                                {
                                                                    "$eq":
                                                                        [
                                                                            "$_id",
                                                                            "$$idChallenge"
                                                                        ]
                                                                },

                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "badge",
                                                    let:
                                                    {
                                                        idBadge: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$ketentuanHadiah.badge.juara1", 0]
                                                            }, 0]
                                                        },

                                                    },
                                                    as: 'winner1',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$_id",
                                                                                            "$$idBadge"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "badge",
                                                    let:
                                                    {
                                                        idBadge: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$ketentuanHadiah.badge.juara2", 0]
                                                            }, 0]
                                                        },

                                                    },
                                                    as: 'winner2',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$_id",
                                                                                            "$$idBadge"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "badge",
                                                    let:
                                                    {
                                                        idBadge: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$ketentuanHadiah.badge.juara3", 0]
                                                            }, 0]
                                                        },

                                                    },
                                                    as: 'winner3',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$_id",
                                                                                            "$$idBadge"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                $set: {
                                                    likes: [
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.suka.HyppeVid", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "vid",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.suka.HyppePic", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "pict",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.suka.HyppeDiary", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "diary",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        //view
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.tonton.HyppeVid", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "vid",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.tonton.HyppePic", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "pict",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.tonton.HyppeDiary", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "diary",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        //post
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.buatKonten.HyppeVid", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "vid",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.buatKonten.HyppePic", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "pict",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.buatKonten.HyppeDiary", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "diary",
                                                                else: "kusnurudin"
                                                            }
                                                        },

                                                    ]
                                                }
                                            },
                                            // {
                                            //     $facet: {
                                            //         metrik: [
                                            //             {
                                            //                 $group: {
                                            //                     _id: "$likes"
                                            //                 }
                                            //             }
                                            //         ]
                                            //     }
                                            // },
                                            // {
                                            //     $set: {
                                            //         metrikAja: {
                                            //             $setUnion: [
                                            //                 {
                                            //                     $arrayElemAt: ["$metrik._id", 0]
                                            //                 },
                                            //                 {
                                            //                     $arrayElemAt: ["$metrik._id", 0]
                                            //                 }
                                            //             ],

                                            //         }
                                            //     }
                                            // }
                                            {
                                                $set: {
                                                    metrikAja: {
                                                        $reduce: {
                                                            input: "$likes",
                                                            initialValue: [],
                                                            in: {
                                                                $cond: [
                                                                    {
                                                                        $in: [
                                                                            "$$this",
                                                                            "$$value"
                                                                        ]
                                                                    },
                                                                    "$$value",
                                                                    {
                                                                        $concatArrays: [
                                                                            "$$value",
                                                                            [
                                                                                "$$this"
                                                                            ]
                                                                        ]
                                                                    }
                                                                ]
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                        ],

                                }
                            },
                            {
                                $lookup: {
                                    from: "postChallenge",
                                    let:
                                    {
                                        idSubChallenges: "$idSubChallenge",
                                        idUsers: "$idUser",
                                        emails: {
                                            "$arrayElemAt":
                                                [
                                                    "$userbasic_data.email",
                                                    0
                                                ]
                                        },
                                        metriks: {
                                            $arrayElemAt: ["$challenges.metrikAja", 0]
                                        }
                                    },
                                    as: 'postChallenges',
                                    pipeline:
                                        [
                                            {
                                                $match: {
                                                    $and: [
                                                        {
                                                            "$expr":
                                                            {
                                                                "$eq":
                                                                    [
                                                                        "$idSubChallenge",
                                                                        "$$idSubChallenges"
                                                                    ]
                                                            },

                                                        },
                                                        {
                                                            "$expr":
                                                            {
                                                                "$eq":
                                                                    [
                                                                        "$idUser",
                                                                        "$$idUsers"
                                                                    ]
                                                            },

                                                        },
                                                        {
                                                            "$expr":
                                                            {
                                                                "$in":
                                                                    [
                                                                        "$postType",
                                                                        "$$metriks"
                                                                    ]
                                                            },
                                                            //
                                                        },

                                                    ]
                                                },

                                            },
                                            {
                                                $sort: {
                                                    score: - 1,
                                                    updatedAt: 1,

                                                }
                                            },
                                            {
                                                $limit: 1
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "posts",
                                                    let:
                                                    {
                                                        idPost: "$postID"
                                                    },
                                                    as: 'posted',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$postID",
                                                                                            "$$idPost"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$posted"
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "posts",
                                                    let:
                                                    {
                                                        idPost: "$postID",
                                                        type: "$posted.postType",
                                                        emails: "$$emails"
                                                    },
                                                    as: 'index',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$postType",
                                                                                            "$$type"
                                                                                        ]
                                                                                },

                                                                            },
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$email",
                                                                                            "$$emails"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },
                                                            {
                                                                $setWindowFields: {
                                                                    partitionBy: "$postType",
                                                                    sortBy: {
                                                                        createdAt: - 1
                                                                    },
                                                                    output: {
                                                                        numbers: {
                                                                            $documentNumber: {}
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
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$postID",
                                                                                            "$$idPost"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },
                                                            {
                                                                $project: {
                                                                    numbers: 1
                                                                }
                                                            }
                                                        ]
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$index"
                                                }
                                            },
                                            {
                                                $project: {
                                                    metriks: "$$metriks",
                                                    score: 1,
                                                    likes: 1,
                                                    postID: "$posted.postID",
                                                    description: "$posted.description",
                                                    postType: "$posted.postType",
                                                    apsaraId: "$posted.apsaraId",
                                                    mediaThumbEndpoint: {
                                                        "$concat": ["/thumb/", "$posted.postID"]
                                                    },
                                                    mediaThumbUri: "$mediaThumb",
                                                    apsaraThumbId: "$posted.apsaraThumbId",
                                                    index: "$index.numbers",

                                                }
                                            },

                                        ]
                                }
                            },

                            {
                                "$project":
                                {
                                    celeng: {
                                        $arrayElemAt: ["$challenges.metrikAja", 0]
                                    },
                                    postChallengess: "$postChallenges",
                                    objectChallenge: "$challenges.objectChallenge",
                                    idUser: 1,
                                    score: 1,
                                    ranking: 1,
                                    lastRank: 1,
                                    idSubChallenge: 1,
                                    // history: //"$lemburTai",
                                    // {
                                    //     $arrayElemAt: ["$lemburTai", 0]
                                    // },
                                    username:
                                    {
                                        "$arrayElemAt":
                                            [
                                                "$userbasic_data.username",
                                                0
                                            ]
                                    },
                                    email:
                                    {
                                        "$arrayElemAt":
                                            [
                                                "$userbasic_data.email",
                                                0
                                            ]
                                    },
                                    avatar:
                                    {
                                        "$arrayElemAt":
                                            [
                                                "$userbasic_data.avatar",
                                                0
                                            ]
                                    },
                                    currentstatistik:
                                    {
                                        "$switch":
                                        {
                                            branches:
                                                [
                                                    {
                                                        case:
                                                        {
                                                            $gt: ["$ranking", "$lastRank"]
                                                        },
                                                        then: "DOWN"
                                                    },
                                                    {
                                                        case:
                                                        {
                                                            $lt: ["$ranking", "$lastRank"]
                                                        },
                                                        then: "UP"
                                                    },

                                                ],
                                            default: "NETRAL"
                                        }
                                    },
                                    isUserLogin: 1,
                                    winnerBadge:
                                    {
                                        "$switch":
                                        {
                                            branches:
                                                [
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 1]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner1.badgeProfile", 0]
                                                            }, 0]
                                                        }
                                                    },
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 2]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner2.badgeProfile", 0]
                                                            }, 0]
                                                        }
                                                    },
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 3]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner3.badgeProfile", 0]
                                                            }, 0]
                                                        }
                                                    },

                                                ],
                                            default: "Anda Kurang Beruntung.. COBA LAGI !!!"
                                        }
                                    },
                                    winnerBadgeOther:
                                    {
                                        "$switch":
                                        {
                                            branches:
                                                [
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 1]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner1.badgeOther", 0]
                                                            }, 0]
                                                        }
                                                    },
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 2]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner2.badgeOther", 0]
                                                            }, 0]
                                                        }
                                                    },
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 3]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner3.badgeOther", 0]
                                                            }, 0]
                                                        }
                                                    },

                                                ],
                                            default: "Anda Kurang Beruntung.. COBA LAGI !!!"
                                        }
                                    },

                                }
                            },
                            {
                                $sort: {
                                    ranking: 1
                                }
                            },

                        ]
                },

            },
            {
                "$lookup": {
                    from: "userbasics",
                    as: "joinUser",
                    let: {
                        localID: new mongoose.Types.ObjectId(iduser)
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ["$_id", "$$localID"]
                                        },

                                    ]
                                }
                            }
                        },

                    ],

                }
            },
            {
                "$lookup": {
                    from: "challenge",
                    as: "peserta",
                    let: {
                        localID: new mongoose.Types.ObjectId(idchallenge)
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ["$_id", "$$localID"]
                                        },

                                    ]
                                }
                            }
                        },
                        //{
                        //		$set:{
                        //				kelaminya:[
                        //						{
                        //                $cond: {
                        //                    if :{
                        //                        $eq: [{
                        //                            $arrayElemAt: [{
                        //                                $arrayElemAt: ["$peserta.peserta.jenisKelamin.Laki-Laki", 0]
                        //                            }, 0]
                        //                        }, "YES"]
                        //                    },
                        //                    then: "Laki-Laki",
                        //                    else : "kusnurudin"
                        //									}
                        //							},
                        //						{
                        //                $cond: {
                        //                    if :{
                        //                        $eq: [{
                        //                            $arrayElemAt: [{
                        //                                $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                        //                            }, 0]
                        //                        }, "YES"]
                        //                    },
                        //                    then: "PEREMPUAN",
                        //                    else : "kusnurudin"
                        //									}
                        //							},
                        //						{
                        //                $cond: {
                        //                    if :{
                        //                        $eq: [{
                        //                            $arrayElemAt: [{
                        //                                $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                        //                            }, 0]
                        //                        }, "YES"]
                        //                    },
                        //                    then: "OTHER",
                        //                    else : "kusnurudin"
                        //									}
                        //							},
                        //				]
                        //		}
                        //},
                    ],

                }
            },
            {
                $set:
                {
                    co: ["MALE", "Male", " MALE", "Laki-laki", "Pria"]
                },

            },
            {
                $set:
                {
                    ce:
                        ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita"]
                }
            },
            {
                $set:
                {
                    all: ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita", "MALE", "Male", " MALE", "Laki-laki", "Pria", "Other"]
                }
            },
            {
                $set:
                {
                    ceOther: ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita", "Other"]
                }
            },
            {
                $set:
                {
                    coOther: ["MALE", " MALE", "Male", "Laki-laki", "Pria", "Other"]
                }
            },
            {
                $set:
                {
                    ceCo: ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita", "Male", "MALE", " MALE", "Laki-laki", "Pria"]
                }
            },
            {
                $set:
                {
                    other: ["Other"]
                }
            },
            {
                $unwind: {
                    path: "$peserta"
                }
            },
            {
                $unwind: {
                    path: "$joinUser"
                }
            },
            {
                $set: {
                    kelamin:
                    {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: "$ce"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: "$co"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: "$other"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: "$ceCo"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: "$coOther"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: "$coOther"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: "$ceOther"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: "$all"
                                },

                            ],
                            default: "kancut"
                        }
                    },

                }
            },
            {
                $set: {
                    verified: {
                        $cond: {
                            if: {
                                $eq: [{
                                    $arrayElemAt: ["$peserta.peserta.tipeAkunTerverikasi", 0]
                                }, "ALL"]
                            },
                            then: true,
                            else: {
                                $cond: {
                                    if: {
                                        $eq: [{
                                            $arrayElemAt: ["$peserta.peserta.tipeAkunTerverikasi", 0]
                                        }, "YES"]
                                    },
                                    else: {
                                        $cond: {
                                            if: {
                                                $eq: [{
                                                    $arrayElemAt: ["$peserta.peserta.tipeAkunTerverikasi", 0]
                                                }, "NO"]
                                            },
                                            then: {
                                                $cond: {
                                                    if: {
                                                        $eq: ["$joinUser.isIdVerified", false]
                                                    },
                                                    then: true,
                                                    else: false
                                                }
                                            },
                                            else: false
                                        }
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $eq: ["$joinUser.isIdVerified", true]
                                            },
                                            then: true,
                                            else: false
                                        }
                                    }
                                }
                            }
                        },

                    },

                }
            },
            {
                $set: {
                    age:
                    {
                        $cond: {
                            if: {
                                $and: ['$joinUser.dob', {
                                    $ne: ["$joinUser.dob", ""]
                                }]
                            },
                            then: {
                                $toInt: {
                                    $divide: [{
                                        $subtract: [new Date(), {
                                            $toDate: "$joinUser.dob"
                                        }]
                                    }, (365 * 24 * 60 * 60 * 1000)]
                                }
                            },
                            else: 0
                        }
                    },

                }
            },
            {
                $set: {

                    ageChallenge:
                    {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: [0, 14]
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $lte: ["$age", 28]
                                            },
                                            else: "error umur 28",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $lte: ["$age", 43]
                                            },
                                            else: "error umur <43",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $lte: ["$age", 100000]
                                            },
                                            else: "error umur >43",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    {
                                                        $lte: ["$age", 100000]
                                                    },
                                                    {
                                                        $gt: ["$age", 14]
                                                    }
                                                ]
                                            },
                                            else: "error umur 14-1000",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    {
                                                        $lte: ["$age", 100000]
                                                    },
                                                    {
                                                        $gt: ["$age", 28]
                                                    }
                                                ]
                                            },
                                            else: "error umur 28-1000",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    {
                                                        $lte: ["$age", 100000]
                                                    },
                                                    {
                                                        $gt: ["$age", 43]
                                                    }
                                                ]
                                            },
                                            else: "error umur 43-1000",
                                            then: true,

                                        }
                                    },

                                },
                                //beda case//
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $or: [
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 14]
                                                            },
                                                            {
                                                                $gt: ["$age", 0]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 100000]
                                                            },
                                                            {
                                                                $gt: ["$age", 28]
                                                            }
                                                        ]
                                                    },

                                                ]
                                            },
                                            else: "error umur 0,28,1000",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $or: [
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 14]
                                                            },
                                                            {
                                                                $gt: ["$age", 0]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 100000]
                                                            },
                                                            {
                                                                $gt: ["$age", 43]
                                                            }
                                                        ]
                                                    },

                                                ]
                                            },
                                            else: "error umur 0,43,1000",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $or: [
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 28]
                                                            },
                                                            {
                                                                $gt: ["$age", 14]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 100000]
                                                            },
                                                            {
                                                                $gt: ["$age", 43]
                                                            }
                                                        ]
                                                    },

                                                ]
                                            },
                                            else: "error umur 0,43,1000",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $or: [
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 28]
                                                            },
                                                            {
                                                                $gt: ["$age", 0]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 100000]
                                                            },
                                                            {
                                                                $gt: ["$age", 43]
                                                            }
                                                        ]
                                                    },

                                                ]
                                            },
                                            else: "error umur 0,43,1000",
                                            then: true,

                                        }
                                    },

                                },

                            ],
                            "default": 10000
                        }
                    }
                }
            },
            {
                $project:
                {
                    postChallengess: "$postChallenges",
                    ageChallenge: 1,
                    age: 1,
                    kelamin: 1,
                    joinUser: 1,
                    "_id": 1,
                    "challengeId": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "isActive": 1,
                    "session": 1,
                    "timenow": 1,
                    "getlastrank": 1,
                    "status": {
                        $cond: {
                            if: {
                                $and: [
                                    {
                                        $lte:
                                            [
                                                "$timenow",
                                                "$endDatetime",

                                            ]
                                    },
                                    {
                                        $gte:
                                            [
                                                "$timenow",
                                                "$startDatetime",

                                            ]
                                    },

                                ]
                            },
                            then: "BERLANGSUNG",
                            else:
                            {
                                $cond: {
                                    if: {
                                        $and: [
                                            {
                                                $lt:
                                                    [
                                                        "$endDatetime",
                                                        "$timenow",

                                                    ]
                                            },

                                        ]
                                    },
                                    else: "AKAN DATANG",
                                    then: "BERAKHIR"
                                }
                            },

                        }
                    },
                    "joined":
                    {
                        $cond: {
                            if: {
                                $in: [true, "$getlastrank.isUserLogin"]
                            },
                            then: "JOINED",
                            else: {
                                $cond: {
                                    if: {
                                        $eq: [{
                                            $arrayElemAt: ["$peserta.peserta.caraGabung", 0]
                                        }, "SEMUA PENGGUNA"]
                                    },
                                    then:
                                    {
                                        $cond: {
                                            if: {
                                                $eq: ["$verified", true]
                                            },
                                            else: "NOT ALLOWED",
                                            then:
                                            {
                                                $cond: {
                                                    if: {
                                                        $in: ["$joinUser.gender", "$kelamin"]
                                                    },
                                                    else: "NOT ALLOWED",
                                                    then:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $eq: ["$ageChallenge", true]
                                                            },
                                                            else: "NOT ALLOWED",
                                                            then:
                                                            {
                                                                $cond: {
                                                                    if: {
                                                                        $in: ["$joinUser.states.$id", {
                                                                            $arrayElemAt: ["$peserta.peserta.lokasiPengguna", 0]
                                                                        }]
                                                                    },
                                                                    else: "NOT ALLOWED",
                                                                    then: "ALLOWED"
                                                                }
                                                            },

                                                        }
                                                    }
                                                }
                                            },

                                        },

                                    },
                                    else: "NOT ALLOWED"
                                }
                            },

                        }
                    },

                }
            },
            {
                "$lookup": {
                    "from": "challenge",
                    "as": "challenge_data",
                    "let": {
                        "local_id": "$challengeId"
                    },
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$eq": ["$_id", "$$local_id"]
                                }
                            }
                        },
                        {
                            $project: {
                                "_id": 1,
                                "nameChallenge": 1,
                                "jenisChallenge": 1,
                                "description": 1,
                                "createdAt": 1,
                                "updatedAt": 1,
                                "durasi": 1,
                                "startChallenge": 1,
                                "endChallenge": 1,
                                "startTime": 1,
                                "endTime": 1,
                                "jenisDurasi": 1,
                                "tampilStatusPengguna": 1,
                                "objectChallenge": 1,
                                "statusChallenge": 1,
                                "metrik": 1,
                                "peserta": 1,
                                "leaderBoard": 1,
                                "ketentuanHadiah": 1,
                                "hadiahPemenang": 1,
                                "bannerSearch": 1,
                                "popUp": 1,
                                "notifikasiPush": 1,
                                "listParticipant": 1
                            }
                        }
                    ]
                }
            },
            {
                "$lookup": {
                    from: "subChallenge",
                    as: "subChallenges",
                    let: {
                        localID: '$challengeId',
                        timeNow: "$timenow",
                    },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    {
                                        $expr:
                                        {
                                            $eq: ["$challengeId", "$$localID"]
                                        },
                                    },
                                    {
                                        $expr:
                                        {
                                            $gte:
                                                [
                                                    "$$timeNow",
                                                    "$endDatetime",

                                                ]
                                        },

                                    },
                                ]
                            }
                        },
                        {
                            $set:
                            {
                                tahun:
                                {
                                    $year: {
                                        $toDate: "$startDatetime"
                                    }
                                }
                            }
                        },
                        {
                            $set:
                            {
                                bulan:
                                {
                                    $month: {
                                        $toDate: "$startDatetime"
                                    }
                                }
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    bulan: "$bulan",
                                    tahun: "$tahun"
                                },
                                "detail": {
                                    $push: "$$ROOT"
                                },

                            }
                        },
                        {
                            $unwind: {
                                path: "$_id"
                            }
                        },
                        {
                            $project: {
                                _id: "$kampret",
                                bulan: "$_id.bulan",
                                tahun: "$_id.tahun",
                                detail: "$detail",

                            }
                        },
                        {
                            $sort: {

                                'detail.bulan': 1
                            }
                        },
                        {
                            $group: {
                                _id: "$tahun",
                                "detail": {
                                    $push: "$$ROOT"
                                },

                            }
                        },
                        {
                            $project: {
                                _id: "$kampret",
                                tahun: "$_id",
                                detail: "$detail",

                            }
                        },
                        {
                            $sort: {
                                tahun: 1,

                            }
                        },

                    ],

                }
            },
            {
                $project:
                {
                    ageChallenge: 1,
                    age: 1,
                    kelamin: 1,
                    //tester: "$joinUser",
                    "_id": 1,
                    "challengeId": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "isActive": 1,
                    "session": 1,
                    "timenow": 1,
                    "getlastrank": 1,
                    "status": 1,
                    //"joined": 1,
                    "joined":
                    {
                        $cond: {
                            if: {
                                $eq: [{
                                    $arrayElemAt: [{
                                        $arrayElemAt: ["$challenge_data.peserta.caraGabung", 0]
                                    }, 0]
                                }, "SEMUA PENGGUNA"]
                            },
                            then: "$joined",
                            else:
                            {
                                $cond: {
                                    if: {
                                        $in: ["$joinUser._id", {
                                            $arrayElemAt: ["$challenge_data.listParticipant", 0]
                                        }]
                                    },
                                    else: "NOT ALLOWED",
                                    then: "ALLOWED"
                                }
                            },

                        },

                    },
                    "challenge_data": 1,
                    subChallenges: 1,
                    //testColi: "$getlastrank.isUserLogin",
                    scoreStatus:
                    {
                        "$switch":
                        {
                            branches:
                                [
                                    {
                                        case:
                                        {
                                            $eq: ["$status", "AKAN DATANG"]
                                        },
                                        then: 1
                                    },
                                    {
                                        case:
                                        {
                                            $eq: ["$status", "BERLANGSUNG"]
                                        },
                                        then: 2
                                    },
                                    {
                                        case:
                                        {
                                            $eq: ["$status", "BERAKHIR"]
                                        },
                                        then: 0
                                    },

                                ],
                            default: 0
                        }
                    },

                }
            },
            {
                $sort: {
                    scoreStatus: - 1,
                    session: 1
                }
            },
            // {
            //     $limit: 1
            // }
        );
        if (status !== undefined) {
            pipeline.push(
                {
                    $match: {
                        status: status
                    }
                }
            );
        }
        if (session !== undefined) {
            pipeline.push(
                {
                    $match: {
                        session: session
                    }
                }
            );
        }

        var query = await this.subChallengeReadModel.aggregate(pipeline);
        return query;
    }

    async getcount(challengeId: string) {
        var query = await this.subChallengeReadModel.aggregate([
            {
                $match: {
                    "challengeId": new mongoose.Types.ObjectId(challengeId),
                }
            },
            {
                $group: {
                    _id: null,
                    totalSession: {
                        $sum: 1
                    }
                }
            }
        ]);
        return query;
    }

    async getListUserChallengeNew2(idchallenge: string, iduser: string, status: string, session: number) {
        var pipeline = [];

        pipeline.push(
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
                    $or:
                        [
                            {
                                "$and":
                                    [
                                        {
                                            challengeId: new mongoose.Types.ObjectId(idchallenge)
                                        },
                                        {
                                            $expr:
                                            {
                                                $lte:
                                                    [
                                                        "$timenow",
                                                        "$endDatetime",

                                                    ]
                                            },

                                        },
                                        {
                                            $expr:
                                            {
                                                $gte:
                                                    [
                                                        "$timenow",
                                                        "$startDatetime",

                                                    ]
                                            },

                                        }
                                    ]
                            },
                            {
                                "$and":
                                    [
                                        {
                                            challengeId: new mongoose.Types.ObjectId(idchallenge)
                                        },
                                        {
                                            $expr:
                                            {
                                                $lte:
                                                    [
                                                        "$timenow",
                                                        "$startDatetime",

                                                    ]
                                            },

                                        },

                                    ]
                            },

                        ]
                },

            },
            {
                "$lookup":
                {
                    from: "userChallenge",
                    let:
                    {
                        userchallenge_fk: "$_id"
                    },
                    as: 'getlastrank',
                    pipeline:
                        [
                            {
                                "$match":
                                {
                                    $or:
                                        [
                                            {
                                                "$and":
                                                    [
                                                        {
                                                            "$expr":
                                                            {
                                                                "$eq":
                                                                    [
                                                                        "$$userchallenge_fk",
                                                                        "$idSubChallenge"
                                                                    ]
                                                            }
                                                        },
                                                        {
                                                            isActive: true
                                                        },
                                                        {
                                                            ranking: {
                                                                $ne: 0
                                                            }
                                                        },
                                                        {
                                                            ranking: {
                                                                $ne: null
                                                            }
                                                        },

                                                    ]
                                            },
                                            {
                                                "$and":
                                                    [
                                                        {
                                                            "$expr":
                                                            {
                                                                "$eq":
                                                                    [
                                                                        "$$userchallenge_fk",
                                                                        "$idSubChallenge"
                                                                    ]
                                                            }
                                                        },
                                                        {
                                                            idUser: new mongoose.Types.ObjectId(iduser)
                                                        },
                                                        {
                                                            isActive: true
                                                        },
                                                        {
                                                            ranking: {
                                                                $ne: 0
                                                            }
                                                        },
                                                        {
                                                            ranking: {
                                                                $ne: null
                                                            }
                                                        },

                                                    ]
                                            }
                                        ]
                                }
                            },
                            {
                                $project: {
                                    "_id": 1,
                                    "idSubChallenge": 1,
                                    "idUser": 1,
                                    "ranking": 1,
                                    "score": 1,
                                    "history": 1,
                                    "isUserLogin": 1,
                                    "celeng": 1,
                                    "postChallengess": 1,
                                    "objectChallenge": 1,
                                    "username": 1,
                                    "email": 1,
                                    "avatar": 1,
                                    "currentstatistik": 1,
                                    "winnerBadge": 1,
                                    "winnerBadgeOther": 1,
                                }
                            },
                            {
                                $set: {
                                    userID: new mongoose.Types.ObjectId(iduser)
                                }
                            },
                            {
                                $set: {
                                    isUserLogin:
                                    {
                                        "$cond":
                                        {
                                            if:
                                            {
                                                "$eq":
                                                    ["$userID", "$idUser"]
                                            },
                                            then: true,
                                            else: false
                                        }
                                    },

                                }
                            },
                            {
                                "$sort":
                                {
                                    isUserLogin: - 1,
                                    ranking: 1
                                }
                            },
                            {
                                $limit: 11
                            },
                            {
                                $set: {
                                    lemburTai:
                                    {
                                        $sortArray: { input: "$history", sortBy: { updatedAt: -1 } }
                                    }
                                }
                            },
                            {
                                $set: {
                                    lastRank:
                                    {
                                        $ifNull:
                                            [
                                                //$arrayElemAt: ["$history.ranking", 0] 
                                                {
                                                    $arrayElemAt: ["$lemburTai.ranking", 0]
                                                },
                                                0
                                            ]
                                    }
                                }
                            },


                            {
                                "$lookup":
                                {
                                    from: "userbasics",
                                    let:
                                    {
                                        basic_fk: "$idUser",

                                    },
                                    as: 'userbasic_data',
                                    pipeline:
                                        [
                                            {
                                                "$match":
                                                {
                                                    "$expr":
                                                    {
                                                        "$eq":
                                                            [
                                                                "$_id",
                                                                "$$basic_fk"
                                                            ]
                                                    }
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "userauths",
                                                    let:
                                                    {
                                                        basic_fk: "$email"
                                                    },
                                                    as: 'userauth_data',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$email",
                                                                                            "$$basic_fk"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "challenge",
                                                    let:
                                                    {
                                                        idChallenge: new mongoose.Types.ObjectId(idchallenge)
                                                    },
                                                    as: 'challenge',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$email",
                                                                                            "$$basic_fk"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                "$project":
                                                {
                                                    _id: 1,
                                                    email: 1,
                                                    username:
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$userauth_data.username",
                                                                0
                                                            ]
                                                    },
                                                    avatar:
                                                    {
                                                        mediaEndpoint:
                                                        {
                                                            "$concat":
                                                                [
                                                                    "/profilepict/",
                                                                    "$profilePict.$id",

                                                                ]
                                                        }
                                                    },

                                                }
                                            }
                                        ]
                                }
                            },
                            {
                                "$lookup":
                                {
                                    from: "challenge",
                                    let:
                                    {
                                        idChallenge: new mongoose.Types.ObjectId(idchallenge)
                                    },
                                    as: 'challenges',
                                    pipeline:
                                        [
                                            {
                                                "$match":
                                                {
                                                    "$and":
                                                        [
                                                            {
                                                                "$expr":
                                                                {
                                                                    "$eq":
                                                                        [
                                                                            "$_id",
                                                                            "$$idChallenge"
                                                                        ]
                                                                },

                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "badge",
                                                    let:
                                                    {
                                                        idBadge: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$ketentuanHadiah.badge.juara1", 0]
                                                            }, 0]
                                                        },

                                                    },
                                                    as: 'winner1',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$_id",
                                                                                            "$$idBadge"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "badge",
                                                    let:
                                                    {
                                                        idBadge: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$ketentuanHadiah.badge.juara2", 0]
                                                            }, 0]
                                                        },

                                                    },
                                                    as: 'winner2',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$_id",
                                                                                            "$$idBadge"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "badge",
                                                    let:
                                                    {
                                                        idBadge: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$ketentuanHadiah.badge.juara3", 0]
                                                            }, 0]
                                                        },

                                                    },
                                                    as: 'winner3',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$_id",
                                                                                            "$$idBadge"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                $set: {
                                                    likes: [
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.suka.HyppeVid", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "vid",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.suka.HyppePic", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "pict",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.suka.HyppeDiary", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "diary",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        //view
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.tonton.HyppeVid", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "vid",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.tonton.HyppePic", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "pict",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.tonton.HyppeDiary", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "diary",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        //post
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.buatKonten.HyppeVid", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "vid",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.buatKonten.HyppePic", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "pict",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.buatKonten.HyppeDiary", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "diary",
                                                                else: "kusnurudin"
                                                            }
                                                        },

                                                    ]
                                                }
                                            },
                                            // {
                                            //     $facet: {
                                            //         metrik: [
                                            //             {
                                            //                 $group: {
                                            //                     _id: "$likes"
                                            //                 }
                                            //             }
                                            //         ]
                                            //     }
                                            // },
                                            // {
                                            //     $set: {
                                            //         metrikAja: {
                                            //             $setUnion: [
                                            //                 {
                                            //                     $arrayElemAt: ["$metrik._id", 0]
                                            //                 },
                                            //                 {
                                            //                     $arrayElemAt: ["$metrik._id", 0]
                                            //                 }
                                            //             ],

                                            //         }
                                            //     }
                                            // }
                                            {
                                                $set: {
                                                    metrikAja: {
                                                        $reduce: {
                                                            input: "$likes",
                                                            initialValue: [],
                                                            in: {
                                                                $cond: [
                                                                    {
                                                                        $in: [
                                                                            "$$this",
                                                                            "$$value"
                                                                        ]
                                                                    },
                                                                    "$$value",
                                                                    {
                                                                        $concatArrays: [
                                                                            "$$value",
                                                                            [
                                                                                "$$this"
                                                                            ]
                                                                        ]
                                                                    }
                                                                ]
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                        ],

                                }
                            },
                            {
                                $lookup: {
                                    from: "postChallenge",
                                    let:
                                    {
                                        idSubChallenges: "$idSubChallenge",
                                        idUsers: "$idUser",
                                        emails: {
                                            "$arrayElemAt":
                                                [
                                                    "$userbasic_data.email",
                                                    0
                                                ]
                                        },
                                        metriks: {
                                            $arrayElemAt: ["$challenges.metrikAja", 0]
                                        }
                                    },
                                    as: 'postChallenges',
                                    pipeline:
                                        [
                                            {
                                                $match: {
                                                    $and: [
                                                        {
                                                            "$expr":
                                                            {
                                                                "$eq":
                                                                    [
                                                                        "$idSubChallenge",
                                                                        "$$idSubChallenges"
                                                                    ]
                                                            },

                                                        },
                                                        {
                                                            "$expr":
                                                            {
                                                                "$eq":
                                                                    [
                                                                        "$idUser",
                                                                        "$$idUsers"
                                                                    ]
                                                            },

                                                        },
                                                        {
                                                            "$expr":
                                                            {
                                                                "$in":
                                                                    [
                                                                        "$postType",
                                                                        "$$metriks"
                                                                    ]
                                                            },
                                                            //
                                                        },

                                                    ]
                                                },

                                            },
                                            {
                                                $sort: {
                                                    score: - 1,
                                                    updatedAt: 1,

                                                }
                                            },
                                            {
                                                $limit: 1
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "posts",
                                                    let:
                                                    {
                                                        idPost: "$postID"
                                                    },
                                                    as: 'posted',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$postID",
                                                                                            "$$idPost"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$posted"
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "posts",
                                                    let:
                                                    {
                                                        idPost: "$postID",
                                                        type: "$posted.postType",
                                                        emails: "$$emails"
                                                    },
                                                    as: 'index',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$postType",
                                                                                            "$$type"
                                                                                        ]
                                                                                },

                                                                            },
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$email",
                                                                                            "$$emails"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },
                                                            {
                                                                $setWindowFields: {
                                                                    partitionBy: "$postType",
                                                                    sortBy: {
                                                                        createdAt: - 1
                                                                    },
                                                                    output: {
                                                                        numbers: {
                                                                            $documentNumber: {}
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
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$postID",
                                                                                            "$$idPost"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },
                                                            {
                                                                $project: {
                                                                    numbers: 1
                                                                }
                                                            }
                                                        ]
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$index"
                                                }
                                            },
                                            {
                                                $project: {
                                                    metriks: "$$metriks",
                                                    score: 1,
                                                    likes: 1,
                                                    postID: "$posted.postID",
                                                    description: "$posted.description",
                                                    postType: "$posted.postType",
                                                    apsaraId: "$posted.apsaraId",
                                                    mediaThumbEndpoint: {
                                                        "$concat": ["/thumb/", "$posted.postID"]
                                                    },
                                                    mediaThumbUri: "$mediaThumb",
                                                    apsaraThumbId: "$posted.apsaraThumbId",
                                                    index: "$index.numbers",

                                                }
                                            },

                                        ]
                                }
                            },

                            {
                                "$project":
                                {
                                    celeng: {
                                        $arrayElemAt: ["$challenges.metrikAja", 0]
                                    },
                                    postChallengess: "$postChallenges",
                                    objectChallenge: "$challenges.objectChallenge",
                                    idUser: 1,
                                    score: 1,
                                    ranking: 1,
                                    lastRank: 1,
                                    idSubChallenge: 1,
                                    // history: //"$lemburTai",
                                    // {
                                    //     $arrayElemAt: ["$lemburTai", 0]
                                    // },
                                    username:
                                    {
                                        "$arrayElemAt":
                                            [
                                                "$userbasic_data.username",
                                                0
                                            ]
                                    },
                                    email:
                                    {
                                        "$arrayElemAt":
                                            [
                                                "$userbasic_data.email",
                                                0
                                            ]
                                    },
                                    avatar:
                                    {
                                        "$arrayElemAt":
                                            [
                                                "$userbasic_data.avatar",
                                                0
                                            ]
                                    },
                                    currentstatistik:
                                    {
                                        "$switch":
                                        {
                                            branches:
                                                [
                                                    {
                                                        case:
                                                        {
                                                            $gt: ["$ranking", "$lastRank"]
                                                        },
                                                        then: "DOWN"
                                                    },
                                                    {
                                                        case:
                                                        {
                                                            $lt: ["$ranking", "$lastRank"]
                                                        },
                                                        then: "UP"
                                                    },

                                                ],
                                            default: "NETRAL"
                                        }
                                    },
                                    isUserLogin: 1,
                                    winnerBadge:
                                    {
                                        "$switch":
                                        {
                                            branches:
                                                [
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 1]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner1.badgeProfile", 0]
                                                            }, 0]
                                                        }
                                                    },
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 2]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner2.badgeProfile", 0]
                                                            }, 0]
                                                        }
                                                    },
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 3]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner3.badgeProfile", 0]
                                                            }, 0]
                                                        }
                                                    },

                                                ],
                                            default: "Anda Kurang Beruntung.. COBA LAGI !!!"
                                        }
                                    },
                                    winnerBadgeOther:
                                    {
                                        "$switch":
                                        {
                                            branches:
                                                [
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 1]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner1.badgeOther", 0]
                                                            }, 0]
                                                        }
                                                    },
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 2]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner2.badgeOther", 0]
                                                            }, 0]
                                                        }
                                                    },
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 3]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner3.badgeOther", 0]
                                                            }, 0]
                                                        }
                                                    },

                                                ],
                                            default: "Anda Kurang Beruntung.. COBA LAGI !!!"
                                        }
                                    },

                                }
                            },
                            {
                                $sort: {
                                    ranking: 1
                                }
                            },

                        ]
                },

            },
            {
                "$lookup": {
                    from: "userbasics",
                    as: "joinUser",
                    let: {
                        localID: new mongoose.Types.ObjectId(iduser)
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ["$_id", "$$localID"]
                                        },

                                    ]
                                }
                            }
                        },

                    ],

                }
            },
            {
                "$lookup": {
                    from: "challenge",
                    as: "peserta",
                    let: {
                        localID: new mongoose.Types.ObjectId(idchallenge)
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ["$_id", "$$localID"]
                                        },

                                    ]
                                }
                            }
                        },
                        //{
                        //		$set:{
                        //				kelaminya:[
                        //						{
                        //                $cond: {
                        //                    if :{
                        //                        $eq: [{
                        //                            $arrayElemAt: [{
                        //                                $arrayElemAt: ["$peserta.peserta.jenisKelamin.Laki-Laki", 0]
                        //                            }, 0]
                        //                        }, "YES"]
                        //                    },
                        //                    then: "Laki-Laki",
                        //                    else : "kusnurudin"
                        //									}
                        //							},
                        //						{
                        //                $cond: {
                        //                    if :{
                        //                        $eq: [{
                        //                            $arrayElemAt: [{
                        //                                $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                        //                            }, 0]
                        //                        }, "YES"]
                        //                    },
                        //                    then: "PEREMPUAN",
                        //                    else : "kusnurudin"
                        //									}
                        //							},
                        //						{
                        //                $cond: {
                        //                    if :{
                        //                        $eq: [{
                        //                            $arrayElemAt: [{
                        //                                $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                        //                            }, 0]
                        //                        }, "YES"]
                        //                    },
                        //                    then: "OTHER",
                        //                    else : "kusnurudin"
                        //									}
                        //							},
                        //				]
                        //		}
                        //},
                    ],

                }
            },
            {
                $set:
                {
                    co: ["MALE", "Male", " MALE", "Laki-laki", "Pria"]
                },

            },
            {
                $set:
                {
                    ce:
                        ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita"]
                }
            },
            {
                $set:
                {
                    all: ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita", "MALE", "Male", " MALE", "Laki-laki", "Pria", "Other"]
                }
            },
            {
                $set:
                {
                    ceOther: ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita", "Other"]
                }
            },
            {
                $set:
                {
                    coOther: ["MALE", " MALE", "Male", "Laki-laki", "Pria", "Other"]
                }
            },
            {
                $set:
                {
                    ceCo: ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita", "Male", "MALE", " MALE", "Laki-laki", "Pria"]
                }
            },
            {
                $set:
                {
                    other: ["Other"]
                }
            },
            {
                $unwind: {
                    path: "$peserta"
                }
            },
            {
                $unwind: {
                    path: "$joinUser"
                }
            },
            {
                $set: {
                    kelamin:
                    {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: "$ce"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: "$co"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: "$other"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: "$ceCo"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: "$coOther"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: "$coOther"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: "$ceOther"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: "$all"
                                },

                            ],
                            default: "kancut"
                        }
                    },

                }
            },
            {
                $set: {
                    verified: {
                        $cond: {
                            if: {
                                $eq: [{
                                    $arrayElemAt: ["$peserta.peserta.tipeAkunTerverikasi", 0]
                                }, "ALL"]
                            },
                            then: true,
                            else: {
                                $cond: {
                                    if: {
                                        $eq: [{
                                            $arrayElemAt: ["$peserta.peserta.tipeAkunTerverikasi", 0]
                                        }, "YES"]
                                    },
                                    else: {
                                        $cond: {
                                            if: {
                                                $eq: [{
                                                    $arrayElemAt: ["$peserta.peserta.tipeAkunTerverikasi", 0]
                                                }, "NO"]
                                            },
                                            then: {
                                                $cond: {
                                                    if: {
                                                        $eq: ["$joinUser.isIdVerified", false]
                                                    },
                                                    then: true,
                                                    else: false
                                                }
                                            },
                                            else: false
                                        }
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $eq: ["$joinUser.isIdVerified", true]
                                            },
                                            then: true,
                                            else: false
                                        }
                                    }
                                }
                            }
                        },

                    },

                }
            },
            {
                $set: {
                    age:
                    {
                        $cond: {
                            if: {
                                $and: ['$joinUser.dob', {
                                    $ne: ["$joinUser.dob", ""]
                                }]
                            },
                            then: {
                                $toInt: {
                                    $divide: [{
                                        $subtract: [new Date(), {
                                            $toDate: "$joinUser.dob"
                                        }]
                                    }, (365 * 24 * 60 * 60 * 1000)]
                                }
                            },
                            else: 0
                        }
                    },

                }
            },
            {
                $set: {

                    ageChallenge:
                    {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: [0, 14]
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $lte: ["$age", 28]
                                            },
                                            else: "error umur 28",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $lte: ["$age", 43]
                                            },
                                            else: "error umur <43",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $lte: ["$age", 100000]
                                            },
                                            else: "error umur >43",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    {
                                                        $lte: ["$age", 100000]
                                                    },
                                                    {
                                                        $gt: ["$age", 14]
                                                    }
                                                ]
                                            },
                                            else: "error umur 14-1000",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    {
                                                        $lte: ["$age", 100000]
                                                    },
                                                    {
                                                        $gt: ["$age", 28]
                                                    }
                                                ]
                                            },
                                            else: "error umur 28-1000",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    {
                                                        $lte: ["$age", 100000]
                                                    },
                                                    {
                                                        $gt: ["$age", 43]
                                                    }
                                                ]
                                            },
                                            else: "error umur 43-1000",
                                            then: true,

                                        }
                                    },

                                },
                                //beda case//
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $or: [
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 14]
                                                            },
                                                            {
                                                                $gt: ["$age", 0]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 100000]
                                                            },
                                                            {
                                                                $gt: ["$age", 28]
                                                            }
                                                        ]
                                                    },

                                                ]
                                            },
                                            else: "error umur 0,28,1000",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $or: [
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 14]
                                                            },
                                                            {
                                                                $gt: ["$age", 0]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 100000]
                                                            },
                                                            {
                                                                $gt: ["$age", 43]
                                                            }
                                                        ]
                                                    },

                                                ]
                                            },
                                            else: "error umur 0,43,1000",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $or: [
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 28]
                                                            },
                                                            {
                                                                $gt: ["$age", 14]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 100000]
                                                            },
                                                            {
                                                                $gt: ["$age", 43]
                                                            }
                                                        ]
                                                    },

                                                ]
                                            },
                                            else: "error umur 0,43,1000",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $or: [
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 28]
                                                            },
                                                            {
                                                                $gt: ["$age", 0]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 100000]
                                                            },
                                                            {
                                                                $gt: ["$age", 43]
                                                            }
                                                        ]
                                                    },

                                                ]
                                            },
                                            else: "error umur 0,43,1000",
                                            then: true,

                                        }
                                    },

                                },

                            ],
                            "default": 10000
                        }
                    }
                }
            },
            {
                $project:
                {
                    postChallengess: "$postChallenges",
                    ageChallenge: 1,
                    age: 1,
                    kelamin: 1,
                    joinUser: 1,
                    "_id": 1,
                    "challengeId": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "isActive": 1,
                    "session": 1,
                    "timenow": 1,
                    "getlastrank": 1,
                    "status": {
                        $cond: {
                            if: {
                                $and: [
                                    {
                                        $lte:
                                            [
                                                "$timenow",
                                                "$endDatetime",

                                            ]
                                    },
                                    {
                                        $gte:
                                            [
                                                "$timenow",
                                                "$startDatetime",

                                            ]
                                    },

                                ]
                            },
                            then: "BERLANGSUNG",
                            else:
                            {
                                $cond: {
                                    if: {
                                        $and: [
                                            {
                                                $lt:
                                                    [
                                                        "$endDatetime",
                                                        "$timenow",

                                                    ]
                                            },

                                        ]
                                    },
                                    else: "AKAN DATANG",
                                    then: "BERAKHIR"
                                }
                            },

                        }
                    },
                    "joined":
                    {
                        $cond: {
                            if: {
                                $in: [true, "$getlastrank.isUserLogin"]
                            },
                            then: "JOINED",
                            else: {
                                $cond: {
                                    if: {
                                        $eq: [{
                                            $arrayElemAt: ["$peserta.peserta.caraGabung", 0]
                                        }, "SEMUA PENGGUNA"]
                                    },
                                    then:
                                    {
                                        $cond: {
                                            if: {
                                                $eq: ["$verified", true]
                                            },
                                            else: "NOT ALLOWED",
                                            then:
                                            {
                                                $cond: {
                                                    if: {
                                                        $in: ["$joinUser.gender", "$kelamin"]
                                                    },
                                                    else: "NOT ALLOWED",
                                                    then:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $eq: ["$ageChallenge", true]
                                                            },
                                                            else: "NOT ALLOWED",
                                                            then:
                                                            {
                                                                $cond: {
                                                                    if: {
                                                                        $in: ["$joinUser.states.$id", {
                                                                            $arrayElemAt: ["$peserta.peserta.lokasiPengguna", 0]
                                                                        }]
                                                                    },
                                                                    else: "NOT ALLOWED",
                                                                    then: "ALLOWED"
                                                                }
                                                            },

                                                        }
                                                    }
                                                }
                                            },

                                        },

                                    },
                                    else: "NOT ALLOWED"
                                }
                            },

                        }
                    },

                }
            },
            {
                "$lookup": {
                    "from": "challenge",
                    "as": "challenge_data",
                    "let": {
                        "local_id": "$challengeId"
                    },
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$eq": ["$_id", "$$local_id"]
                                }
                            }
                        },
                        {
                            $project: {
                                "_id": 1,
                                "nameChallenge": 1,
                                "jenisChallenge": 1,
                                "description": 1,
                                "createdAt": 1,
                                "updatedAt": 1,
                                "durasi": 1,
                                "startChallenge": 1,
                                "endChallenge": 1,
                                "startTime": 1,
                                "endTime": 1,
                                "jenisDurasi": 1,
                                "tampilStatusPengguna": 1,
                                "objectChallenge": 1,
                                "statusChallenge": 1,
                                "metrik": 1,
                                "peserta": 1,
                                "leaderBoard": 1,
                                "ketentuanHadiah": 1,
                                "hadiahPemenang": 1,
                                "bannerSearch": 1,
                                "popUp": 1,
                                "notifikasiPush": 1,
                                "listParticipant": 1
                            }
                        }
                    ]
                }
            },
            {
                "$lookup": {
                    from: "subChallenge",
                    as: "subChallenges",
                    let: {
                        localID: '$challengeId',
                        timeNow: "$timenow",
                    },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    {
                                        $expr:
                                        {
                                            $eq: ["$challengeId", "$$localID"]
                                        },
                                    },
                                    {
                                        $expr:
                                        {
                                            $gte:
                                                [
                                                    "$$timeNow",
                                                    "$endDatetime",

                                                ]
                                        },

                                    },
                                ]
                            }
                        },
                        {
                            $set:
                            {
                                tahun:
                                {
                                    $year: {
                                        $toDate: "$startDatetime"
                                    }
                                }
                            }
                        },
                        {
                            $set:
                            {
                                bulan:
                                {
                                    $month: {
                                        $toDate: "$startDatetime"
                                    }
                                }
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    bulan: "$bulan",
                                    tahun: "$tahun"
                                },
                                "detail": {
                                    $push: "$$ROOT"
                                },

                            }
                        },
                        {
                            $unwind: {
                                path: "$_id"
                            }
                        },
                        {
                            $project: {
                                _id: "$kampret",
                                bulan: "$_id.bulan",
                                tahun: "$_id.tahun",
                                detail: "$detail",

                            }
                        },
                        {
                            $sort: {

                                'detail.bulan': 1
                            }
                        },
                        {
                            $group: {
                                _id: "$tahun",
                                "detail": {
                                    $push: "$$ROOT"
                                },

                            }
                        },
                        {
                            $project: {
                                _id: "$kampret",
                                tahun: "$_id",
                                detail: "$detail",

                            }
                        },
                        {
                            $sort: {
                                tahun: 1,

                            }
                        },

                    ],

                }
            },
            {
                $project:
                {
                    ageChallenge: 1,
                    age: 1,
                    kelamin: 1,
                    //tester: "$joinUser",
                    "_id": 1,
                    "challengeId": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "isActive": 1,
                    "session": 1,
                    "timenow": 1,
                    "getlastrank": 1,
                    "status": 1,
                    //"joined": 1,
                    "joined":
                    {
                        $cond: {
                            if: {
                                $eq: [{
                                    $arrayElemAt: [{
                                        $arrayElemAt: ["$challenge_data.peserta.caraGabung", 0]
                                    }, 0]
                                }, "SEMUA PENGGUNA"]
                            },
                            then: "$joined",
                            else:
                            {
                                $cond: {
                                    if: {
                                        $in: ["$joinUser._id", {
                                            $arrayElemAt: ["$challenge_data.listParticipant", 0]
                                        }]
                                    },
                                    else: "NOT ALLOWED",
                                    then: "ALLOWED"
                                }
                            },

                        },

                    },
                    "challenge_data": 1,
                    subChallenges: 1,
                    //testColi: "$getlastrank.isUserLogin",
                    scoreStatus:
                    {
                        "$switch":
                        {
                            branches:
                                [
                                    {
                                        case:
                                        {
                                            $eq: ["$status", "AKAN DATANG"]
                                        },
                                        then: 1
                                    },
                                    {
                                        case:
                                        {
                                            $eq: ["$status", "BERLANGSUNG"]
                                        },
                                        then: 2
                                    },
                                    {
                                        case:
                                        {
                                            $eq: ["$status", "BERAKHIR"]
                                        },
                                        then: 0
                                    },

                                ],
                            default: 0
                        }
                    },

                }
            },
            {
                $sort: {
                    scoreStatus: - 1,
                    session: 1
                }
            },
            {
                $limit: 1
            }
        );

        if (status !== undefined) {
            pipeline.push(
                {
                    $match: {
                        status: status
                    }
                }
            );
        }
        if (session !== undefined) {
            pipeline.push(
                {
                    $match: {
                        session: session
                    }
                }
            );
        }

        var query = await this.subChallengeReadModel.aggregate(pipeline);
        return query;
    }

    async getListUserChallengeNew3(idchallenge: string, iduser: string, status: string, session: number) {
        var pipeline = [];

        pipeline.push(
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
                    $or:
                        [
                            {
                                "$and":
                                    [
                                        {
                                            challengeId: new mongoose.Types.ObjectId(idchallenge)
                                        },
                                        {
                                            $expr:
                                            {
                                                $lte:
                                                    [
                                                        "$timenow",
                                                        "$endDatetime",

                                                    ]
                                            },

                                        },
                                        {
                                            $expr:
                                            {
                                                $gte:
                                                    [
                                                        "$timenow",
                                                        "$startDatetime",

                                                    ]
                                            },

                                        }
                                    ]
                            },
                            {
                                "$and":
                                    [
                                        {
                                            challengeId: new mongoose.Types.ObjectId(idchallenge)
                                        },
                                        {
                                            $expr:
                                            {
                                                $lte:
                                                    [
                                                        "$timenow",
                                                        "$startDatetime",

                                                    ]
                                            },

                                        },

                                    ]
                            },

                        ]
                },

            },
            {
                "$lookup":
                {
                    from: "userChallenge",
                    let:
                    {
                        userchallenge_fk: "$_id"
                    },
                    as: 'getlastrank',
                    pipeline:
                        [
                            {
                                $match: {
                                    $and: [
                                        {
                                            "$expr":
                                            {
                                                "$eq":
                                                    [
                                                        "$$userchallenge_fk",
                                                        "$idSubChallenge"
                                                    ]
                                            }
                                        },
                                        {
                                            isActive: true
                                        },
                                    ]
                                }
                            },
                            {
                                $sort: {
                                    score: - 1
                                }
                            },
                            {
                                $setWindowFields: {
                                    partitionBy: "$$userchallenge_fk",
                                    sortBy: {
                                        score: - 1
                                    },
                                    output: {
                                        rankNew: {
                                            $documentNumber: {}
                                        }
                                    }
                                }
                            },
                            {
                                "$match":
                                {
                                    $or:
                                        [
                                            {
                                                "$and":
                                                    [
                                                        {
                                                            "$expr":
                                                            {
                                                                "$eq":
                                                                    [
                                                                        "$$userchallenge_fk",
                                                                        "$idSubChallenge"
                                                                    ]
                                                            }
                                                        },
                                                        {
                                                            isActive: true
                                                        },
                                                        {
                                                            score: {
                                                                $ne: 0
                                                            }
                                                        },
                                                        {
                                                            score: {
                                                                $ne: null
                                                            }
                                                        },

                                                    ]
                                            },
                                            {
                                                "$and":
                                                    [
                                                        {
                                                            "$expr":
                                                            {
                                                                "$eq":
                                                                    [
                                                                        "$$userchallenge_fk",
                                                                        "$idSubChallenge"
                                                                    ]
                                                            }
                                                        },
                                                        {
                                                            idUser: new mongoose.Types.ObjectId(iduser)
                                                        },
                                                        {
                                                            isActive: true
                                                        },
                                                        {
                                                            score: {
                                                                $ne: 0
                                                            }
                                                        },
                                                        {
                                                            score: {
                                                                $ne: null
                                                            }
                                                        },

                                                    ]
                                            }
                                        ]
                                }
                            },

                            {
                                $project: {
                                    "_id": 1,
                                    "idSubChallenge": 1,
                                    "idUser": 1,
                                    "ranking": "$rankNew",
                                    "score": 1,
                                    //"history": 1,
                                    "isUserLogin": 1,
                                    "celeng": 1,
                                    "postChallengess": 1,
                                    "objectChallenge": 1,
                                    "username": 1,
                                    "email": 1,
                                    "avatar": 1,
                                    "currentstatistik": 1,
                                    "winnerBadge": 1,
                                    "winnerBadgeOther": 1,

                                }
                            },
                            {
                                $set: {
                                    userID: new mongoose.Types.ObjectId(iduser)
                                }
                            },
                            {
                                $set: {
                                    isUserLogin:
                                    {
                                        "$cond":
                                        {
                                            if:
                                            {
                                                "$eq":
                                                    ["$userID", "$idUser"]
                                            },
                                            then: true,
                                            else: false
                                        }
                                    },

                                }
                            },
                            {
                                "$sort":
                                {
                                    isUserLogin: - 1,
                                    ranking: 1
                                }
                            },
                            {
                                $limit: 11
                            },
                            //{
                            //    $set: {
                            //        lemburTai: 
                            //        {
                            //            $sortArray: {
                            //                input: "$history",
                            //                sortBy: {
                            //                    updatedAt: - 1
                            //                }
                            //            }
                            //        }
                            //    }
                            //},
                            //{
                            //    $set: {
                            //        lastRank: 
                            //        {
                            //            $ifNull: 
                            //            [
                            //                //$arrayElemAt: ["$history.ranking", 0] 
                            //                {
                            //                    $arrayElemAt: ["$lemburTai.ranking", 0]
                            //                },
                            //                0
                            //            ]
                            //        }
                            //    }
                            //},
                            {
                                "$lookup":
                                {
                                    from: "userbasics",
                                    let:
                                    {
                                        basic_fk: "$idUser",

                                    },
                                    as: 'userbasic_data',
                                    pipeline:
                                        [
                                            {
                                                "$match":
                                                {
                                                    "$expr":
                                                    {
                                                        "$eq":
                                                            [
                                                                "$_id",
                                                                "$$basic_fk"
                                                            ]
                                                    }
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "userauths",
                                                    let:
                                                    {
                                                        basic_fk: "$email"
                                                    },
                                                    as: 'userauth_data',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$email",
                                                                                            "$$basic_fk"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "challenge",
                                                    let:
                                                    {
                                                        idChallenge: new mongoose.Types.ObjectId(idchallenge)
                                                    },
                                                    as: 'challenge',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$email",
                                                                                            "$$basic_fk"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                "$project":
                                                {
                                                    _id: 1,
                                                    email: 1,
                                                    username:
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$userauth_data.username",
                                                                0
                                                            ]
                                                    },
                                                    avatar:
                                                    {
                                                        mediaEndpoint:
                                                        {
                                                            "$concat":
                                                                [
                                                                    "/profilepict/",
                                                                    "$profilePict.$id",

                                                                ]
                                                        }
                                                    },

                                                }
                                            }
                                        ]
                                }
                            },
                            {
                                "$lookup":
                                {
                                    from: "challenge",
                                    let:
                                    {
                                        idChallenge: new mongoose.Types.ObjectId(idchallenge)
                                    },
                                    as: 'challenges',
                                    pipeline:
                                        [
                                            {
                                                "$match":
                                                {
                                                    "$and":
                                                        [
                                                            {
                                                                "$expr":
                                                                {
                                                                    "$eq":
                                                                        [
                                                                            "$_id",
                                                                            "$$idChallenge"
                                                                        ]
                                                                },

                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "badge",
                                                    let:
                                                    {
                                                        idBadge: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$ketentuanHadiah.badge.juara1", 0]
                                                            }, 0]
                                                        },

                                                    },
                                                    as: 'winner1',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$_id",
                                                                                            "$$idBadge"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "badge",
                                                    let:
                                                    {
                                                        idBadge: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$ketentuanHadiah.badge.juara2", 0]
                                                            }, 0]
                                                        },

                                                    },
                                                    as: 'winner2',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$_id",
                                                                                            "$$idBadge"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "badge",
                                                    let:
                                                    {
                                                        idBadge: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$ketentuanHadiah.badge.juara3", 0]
                                                            }, 0]
                                                        },

                                                    },
                                                    as: 'winner3',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$_id",
                                                                                            "$$idBadge"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                $set: {
                                                    likes: [
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.suka.HyppeVid", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "vid",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.suka.HyppePic", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "pict",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.suka.HyppeDiary", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "diary",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        //view
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.tonton.HyppeVid", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "vid",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.tonton.HyppePic", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "pict",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.tonton.HyppeDiary", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "diary",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        //post
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.buatKonten.HyppeVid", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "vid",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.buatKonten.HyppePic", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "pict",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.buatKonten.HyppeDiary", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "diary",
                                                                else: "kusnurudin"
                                                            }
                                                        },

                                                    ]
                                                }
                                            },
                                            // {
                                            //     $facet: {
                                            //         metrik: [
                                            //             {
                                            //                 $group: {
                                            //                     _id: "$likes"
                                            //                 }
                                            //             }
                                            //         ]
                                            //     }
                                            // },
                                            // {
                                            //     $set: {
                                            //         metrikAja: {
                                            //             $setUnion: [
                                            //                 {
                                            //                     $arrayElemAt: ["$metrik._id", 0]
                                            //                 },
                                            //                 {
                                            //                     $arrayElemAt: ["$metrik._id", 0]
                                            //                 }
                                            //             ],

                                            //         }
                                            //     }
                                            // }
                                            {
                                                $set: {
                                                    metrikAja: {
                                                        $reduce: {
                                                            input: "$likes",
                                                            initialValue: [],
                                                            in: {
                                                                $cond: [
                                                                    {
                                                                        $in: [
                                                                            "$$this",
                                                                            "$$value"
                                                                        ]
                                                                    },
                                                                    "$$value",
                                                                    {
                                                                        $concatArrays: [
                                                                            "$$value",
                                                                            [
                                                                                "$$this"
                                                                            ]
                                                                        ]
                                                                    }
                                                                ]
                                                            }
                                                        }
                                                    }
                                                }
                                            },

                                        ],

                                }
                            },
                            {
                                $lookup: {
                                    from: "postChallenge",
                                    let:
                                    {
                                        idSubChallenges: "$idSubChallenge",
                                        idUsers: "$idUser",
                                        emails: {
                                            "$arrayElemAt":
                                                [
                                                    "$userbasic_data.email",
                                                    0
                                                ]
                                        },
                                        metriks: {
                                            $arrayElemAt: ["$challenges.metrikAja", 0]
                                        }
                                    },
                                    as: 'postChallenges',
                                    pipeline:
                                        [
                                            {
                                                $match: {
                                                    $and: [
                                                        {
                                                            "$expr":
                                                            {
                                                                "$eq":
                                                                    [
                                                                        "$idSubChallenge",
                                                                        "$$idSubChallenges"
                                                                    ]
                                                            },

                                                        },
                                                        {
                                                            "$expr":
                                                            {
                                                                "$eq":
                                                                    [
                                                                        "$idUser",
                                                                        "$$idUsers"
                                                                    ]
                                                            },

                                                        },
                                                        {
                                                            "$expr":
                                                            {
                                                                "$in":
                                                                    [
                                                                        "$postType",
                                                                        "$$metriks"
                                                                    ]
                                                            },
                                                            //
                                                        },

                                                    ]
                                                },

                                            },
                                            {
                                                $sort: {
                                                    score: - 1,
                                                    updatedAt: 1,

                                                }
                                            },
                                            {
                                                $limit: 1
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "posts",
                                                    let:
                                                    {
                                                        idPost: "$postID"
                                                    },
                                                    as: 'posted',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$postID",
                                                                                            "$$idPost"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$posted"
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "posts",
                                                    let:
                                                    {
                                                        idPost: "$postID",
                                                        type: "$posted.postType",
                                                        emails: "$$emails"
                                                    },
                                                    as: 'index',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$postType",
                                                                                            "$$type"
                                                                                        ]
                                                                                },

                                                                            },
                                                                            {
                                                                                "active": true,
                                                                            },
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$email",
                                                                                            "$$emails"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },
                                                            {
                                                                $setWindowFields: {
                                                                    partitionBy: "$postType",
                                                                    sortBy: {
                                                                        createdAt: - 1
                                                                    },
                                                                    output: {
                                                                        numbers: {
                                                                            $documentNumber: {}
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
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$postID",
                                                                                            "$$idPost"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },
                                                            {
                                                                $project: {
                                                                    numbers: 1
                                                                }
                                                            }
                                                        ]
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$index"
                                                }
                                            },
                                            {
                                                $project: {
                                                    metriks: "$$metriks",
                                                    score: 1,
                                                    likes: 1,
                                                    postID: "$posted.postID",
                                                    description: "$posted.description",
                                                    postType: "$posted.postType",
                                                    apsaraId: "$posted.apsaraId",
                                                    mediaThumbEndpoint: {
                                                        "$concat": ["/thumb/", "$posted.postID"]
                                                    },
                                                    mediaThumbUri: "$mediaThumb",
                                                    apsaraThumbId: "$posted.apsaraThumbId",
                                                    index: "$index.numbers",

                                                }
                                            },

                                        ]
                                }
                            },
                            {
                                "$project":
                                {
                                    celeng: {
                                        $arrayElemAt: ["$challenges.metrikAja", 0]
                                    },
                                    postChallengess: "$postChallenges",
                                    objectChallenge: "$challenges.objectChallenge",
                                    idUser: 1,
                                    score: 1,
                                    ranking: 1,
                                    lastRank: 1,
                                    idSubChallenge: 1,
                                    // history: //"$lemburTai",
                                    // {
                                    //     $arrayElemAt: ["$lemburTai", 0]
                                    // },
                                    username:
                                    {
                                        "$arrayElemAt":
                                            [
                                                "$userbasic_data.username",
                                                0
                                            ]
                                    },
                                    email:
                                    {
                                        "$arrayElemAt":
                                            [
                                                "$userbasic_data.email",
                                                0
                                            ]
                                    },
                                    avatar:
                                    {
                                        "$arrayElemAt":
                                            [
                                                "$userbasic_data.avatar",
                                                0
                                            ]
                                    },
                                    currentstatistik:
                                    {
                                        "$switch":
                                        {
                                            branches:
                                                [
                                                    {
                                                        case:
                                                        {
                                                            $gt: ["$ranking", "$lastRank"]
                                                        },
                                                        then: "NETRAL"
                                                    },
                                                    {
                                                        case:
                                                        {
                                                            $lt: ["$ranking", "$lastRank"]
                                                        },
                                                        then: "NETRAL"
                                                    },

                                                ],
                                            default: "NETRAL"
                                        }
                                    },
                                    isUserLogin: 1,
                                    winnerBadge:
                                    {
                                        "$switch":
                                        {
                                            branches:
                                                [
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 1]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner1.badgeProfile", 0]
                                                            }, 0]
                                                        }
                                                    },
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 2]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner2.badgeProfile", 0]
                                                            }, 0]
                                                        }
                                                    },
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 3]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner3.badgeProfile", 0]
                                                            }, 0]
                                                        }
                                                    },

                                                ],
                                            default: "Anda Kurang Beruntung.. COBA LAGI !!!"
                                        }
                                    },
                                    winnerBadgeOther:
                                    {
                                        "$switch":
                                        {
                                            branches:
                                                [
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 1]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner1.badgeOther", 0]
                                                            }, 0]
                                                        }
                                                    },
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 2]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner2.badgeOther", 0]
                                                            }, 0]
                                                        }
                                                    },
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 3]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner3.badgeOther", 0]
                                                            }, 0]
                                                        }
                                                    },

                                                ],
                                            default: "Anda Kurang Beruntung.. COBA LAGI !!!"
                                        }
                                    },

                                }
                            },
                            {
                                $sort: {
                                    ranking: 1
                                }
                            },

                        ]
                },

            },
            {
                "$lookup": {
                    from: "userbasics",
                    as: "joinUser",
                    let: {
                        localID: new mongoose.Types.ObjectId(iduser)
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ["$_id", "$$localID"]
                                        },

                                    ]
                                }
                            }
                        },

                    ],

                }
            },
            {
                "$lookup": {
                    from: "challenge",
                    as: "peserta",
                    let: {
                        localID: new mongoose.Types.ObjectId(idchallenge)
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ["$_id", "$$localID"]
                                        },

                                    ]
                                }
                            }
                        },
                        //{
                        //		$set:{
                        //				kelaminya:[
                        //						{
                        //                $cond: {
                        //                    if :{
                        //                        $eq: [{
                        //                            $arrayElemAt: [{
                        //                                $arrayElemAt: ["$peserta.peserta.jenisKelamin.Laki-Laki", 0]
                        //                            }, 0]
                        //                        }, "YES"]
                        //                    },
                        //                    then: "Laki-Laki",
                        //                    else : "kusnurudin"
                        //									}
                        //							},
                        //						{
                        //                $cond: {
                        //                    if :{
                        //                        $eq: [{
                        //                            $arrayElemAt: [{
                        //                                $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                        //                            }, 0]
                        //                        }, "YES"]
                        //                    },
                        //                    then: "PEREMPUAN",
                        //                    else : "kusnurudin"
                        //									}
                        //							},
                        //						{
                        //                $cond: {
                        //                    if :{
                        //                        $eq: [{
                        //                            $arrayElemAt: [{
                        //                                $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                        //                            }, 0]
                        //                        }, "YES"]
                        //                    },
                        //                    then: "OTHER",
                        //                    else : "kusnurudin"
                        //									}
                        //							},
                        //				]
                        //		}
                        //},
                    ],

                }
            },
            {
                $set:
                {
                    co: ["MALE", "Male", " MALE", "Laki-laki", "Pria"]
                },

            },
            {
                $set:
                {
                    ce:
                        ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita"]
                }
            },
            {
                $set:
                {
                    all: ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita", "MALE", "Male", " MALE", "Laki-laki", "Pria", "Other"]
                }
            },
            {
                $set:
                {
                    ceOther: ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita", "Other"]
                }
            },
            {
                $set:
                {
                    coOther: ["MALE", " MALE", "Male", "Laki-laki", "Pria", "Other"]
                }
            },
            {
                $set:
                {
                    ceCo: ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita", "Male", "MALE", " MALE", "Laki-laki", "Pria"]
                }
            },
            {
                $set:
                {
                    other: ["Other"]
                }
            },
            {
                $unwind: {
                    path: "$peserta"
                }
            },
            {
                $unwind: {
                    path: "$joinUser"
                }
            },
            {
                $set: {
                    kelamin:
                    {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: "$ce"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: "$co"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: "$other"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: "$ceCo"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: "$coOther"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: "$coOther"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: "$ceOther"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: "$all"
                                },

                            ],
                            default: "kancut"
                        }
                    },

                }
            },
            {
                $set: {
                    verified: {
                        $cond: {
                            if: {
                                $eq: [{
                                    $arrayElemAt: ["$peserta.peserta.tipeAkunTerverikasi", 0]
                                }, "ALL"]
                            },
                            then: true,
                            else: {
                                $cond: {
                                    if: {
                                        $eq: [{
                                            $arrayElemAt: ["$peserta.peserta.tipeAkunTerverikasi", 0]
                                        }, "YES"]
                                    },
                                    else: {
                                        $cond: {
                                            if: {
                                                $eq: [{
                                                    $arrayElemAt: ["$peserta.peserta.tipeAkunTerverikasi", 0]
                                                }, "NO"]
                                            },
                                            then: {
                                                $cond: {
                                                    if: {
                                                        $eq: ["$joinUser.isIdVerified", false]
                                                    },
                                                    then: true,
                                                    else: false
                                                }
                                            },
                                            else: false
                                        }
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $eq: ["$joinUser.isIdVerified", true]
                                            },
                                            then: true,
                                            else: false
                                        }
                                    }
                                }
                            }
                        },

                    },

                }
            },
            {
                $set: {
                    age:
                    {
                        $cond: {
                            if: {
                                $and: ['$joinUser.dob', {
                                    $ne: ["$joinUser.dob", ""]
                                }]
                            },
                            then: {
                                $toInt: {
                                    $divide: [{
                                        $subtract: [new Date(), {
                                            $toDate: "$joinUser.dob"
                                        }]
                                    }, (365 * 24 * 60 * 60 * 1000)]
                                }
                            },
                            else: 0
                        }
                    },

                }
            },
            {
                $set: {

                    ageChallenge:
                    {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: [0, 14]
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $lte: ["$age", 28]
                                            },
                                            else: "error umur 28",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $lte: ["$age", 43]
                                            },
                                            else: "error umur <43",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $lte: ["$age", 100000]
                                            },
                                            else: "error umur >43",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    {
                                                        $lte: ["$age", 100000]
                                                    },
                                                    {
                                                        $gt: ["$age", 14]
                                                    }
                                                ]
                                            },
                                            else: "error umur 14-1000",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    {
                                                        $lte: ["$age", 100000]
                                                    },
                                                    {
                                                        $gt: ["$age", 28]
                                                    }
                                                ]
                                            },
                                            else: "error umur 28-1000",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    {
                                                        $lte: ["$age", 100000]
                                                    },
                                                    {
                                                        $gt: ["$age", 43]
                                                    }
                                                ]
                                            },
                                            else: "error umur 43-1000",
                                            then: true,

                                        }
                                    },

                                },
                                //beda case//
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $or: [
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 14]
                                                            },
                                                            {
                                                                $gt: ["$age", 0]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 100000]
                                                            },
                                                            {
                                                                $gt: ["$age", 28]
                                                            }
                                                        ]
                                                    },

                                                ]
                                            },
                                            else: "error umur 0,28,1000",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $or: [
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 14]
                                                            },
                                                            {
                                                                $gt: ["$age", 0]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 100000]
                                                            },
                                                            {
                                                                $gt: ["$age", 43]
                                                            }
                                                        ]
                                                    },

                                                ]
                                            },
                                            else: "error umur 0,43,1000",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $or: [
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 28]
                                                            },
                                                            {
                                                                $gt: ["$age", 14]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 100000]
                                                            },
                                                            {
                                                                $gt: ["$age", 43]
                                                            }
                                                        ]
                                                    },

                                                ]
                                            },
                                            else: "error umur 0,43,1000",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $or: [
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 28]
                                                            },
                                                            {
                                                                $gt: ["$age", 0]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 100000]
                                                            },
                                                            {
                                                                $gt: ["$age", 43]
                                                            }
                                                        ]
                                                    },

                                                ]
                                            },
                                            else: "error umur 0,43,1000",
                                            then: true,

                                        }
                                    },

                                },

                            ],
                            "default": 10000
                        }
                    }
                }
            },
            {
                $project:
                {
                    postChallengess: "$postChallenges",
                    ageChallenge: 1,
                    age: 1,
                    kelamin: 1,
                    joinUser: 1,
                    "_id": 1,
                    "challengeId": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "isActive": 1,
                    "session": 1,
                    "timenow": 1,
                    "getlastrank": 1,
                    "status": {
                        $cond: {
                            if: {
                                $and: [
                                    {
                                        $lte:
                                            [
                                                "$timenow",
                                                "$endDatetime",

                                            ]
                                    },
                                    {
                                        $gte:
                                            [
                                                "$timenow",
                                                "$startDatetime",

                                            ]
                                    },

                                ]
                            },
                            then: "BERLANGSUNG",
                            else:
                            {
                                $cond: {
                                    if: {
                                        $and: [
                                            {
                                                $lt:
                                                    [
                                                        "$endDatetime",
                                                        "$timenow",

                                                    ]
                                            },

                                        ]
                                    },
                                    else: "AKAN DATANG",
                                    then: "BERAKHIR"
                                }
                            },

                        }
                    },
                    "joined":
                    {
                        $cond: {
                            if: {
                                $in: [true, "$getlastrank.isUserLogin"]
                            },
                            then: "JOINED",
                            else: {
                                $cond: {
                                    if: {
                                        $eq: [{
                                            $arrayElemAt: ["$peserta.peserta.caraGabung", 0]
                                        }, "SEMUA PENGGUNA"]
                                    },
                                    then:
                                    {
                                        $cond: {
                                            if: {
                                                $eq: ["$verified", true]
                                            },
                                            else: "NOT ALLOWED",
                                            then:
                                            {
                                                $cond: {
                                                    if: {
                                                        $in: ["$joinUser.gender", "$kelamin"]
                                                    },
                                                    else: "NOT ALLOWED",
                                                    then:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $eq: ["$ageChallenge", true]
                                                            },
                                                            else: "NOT ALLOWED",
                                                            then:
                                                            {
                                                                $cond: {
                                                                    if: {
                                                                        $in: ["$joinUser.states.$id", {
                                                                            $arrayElemAt: ["$peserta.peserta.lokasiPengguna", 0]
                                                                        }]
                                                                    },
                                                                    else: "NOT ALLOWED",
                                                                    then: "ALLOWED"
                                                                }
                                                            },

                                                        }
                                                    }
                                                }
                                            },

                                        },

                                    },
                                    else: "NOT ALLOWED"
                                }
                            },

                        }
                    },

                }
            },
            {
                "$lookup": {
                    "from": "challenge",
                    "as": "challenge_data",
                    "let": {
                        "local_id": "$challengeId"
                    },
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$eq": ["$_id", "$$local_id"]
                                }
                            }
                        },
                        {
                            $project: {
                                "_id": 1,
                                "nameChallenge": 1,
                                "jenisChallenge": 1,
                                "description": 1,
                                "createdAt": 1,
                                "updatedAt": 1,
                                "durasi": 1,
                                "startChallenge": 1,
                                "endChallenge": 1,
                                "startTime": 1,
                                "endTime": 1,
                                "jenisDurasi": 1,
                                "tampilStatusPengguna": 1,
                                "objectChallenge": 1,
                                "statusChallenge": 1,
                                "metrik": 1,
                                "peserta": 1,
                                "leaderBoard": 1,
                                "ketentuanHadiah": 1,
                                "hadiahPemenang": 1,
                                "bannerSearch": 1,
                                "popUp": 1,
                                "notifikasiPush": 1,
                                "listParticipant": 1
                            }
                        }
                    ]
                }
            },
            {
                "$lookup": {
                    from: "subChallenge",
                    as: "subChallenges",
                    let: {
                        localID: '$challengeId',
                        timeNow: "$timenow",

                    },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    {
                                        $expr:
                                        {
                                            $eq: ["$challengeId", "$$localID"]
                                        },

                                    },
                                    {
                                        $expr:
                                        {
                                            $gte:
                                                [
                                                    "$$timeNow",
                                                    "$endDatetime",

                                                ]
                                        },

                                    },

                                ]
                            }
                        },
                        {
                            $set:
                            {
                                tahun:
                                {
                                    $year: {
                                        $toDate: "$startDatetime"
                                    }
                                }
                            }
                        },
                        {
                            $set:
                            {
                                bulan:
                                {
                                    $month: {
                                        $toDate: "$startDatetime"
                                    }
                                }
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    bulan: "$bulan",
                                    tahun: "$tahun"
                                },
                                "detail": {
                                    $push: "$$ROOT"
                                },

                            }
                        },
                        {
                            $unwind: {
                                path: "$_id"
                            }
                        },
                        {
                            $project: {
                                _id: "$kampret",
                                bulan: "$_id.bulan",
                                tahun: "$_id.tahun",
                                detail: "$detail",

                            }
                        },
                        {
                            $sort: {

                                'detail.bulan': 1
                            }
                        },
                        {
                            $group: {
                                _id: "$tahun",
                                "detail": {
                                    $push: "$$ROOT"
                                },

                            }
                        },
                        {
                            $project: {
                                _id: "$kampret",
                                tahun: "$_id",
                                detail: "$detail",

                            }
                        },
                        {
                            $sort: {
                                tahun: 1,

                            }
                        },

                    ],

                }
            },
            {
                $project:
                {
                    ageChallenge: 1,
                    age: 1,
                    kelamin: 1,
                    //tester: "$joinUser",
                    "_id": 1,
                    "challengeId": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "isActive": 1,
                    "session": 1,
                    "timenow": 1,
                    "getlastrank": 1,
                    "status": 1,
                    //"joined": 1,
                    "joined":
                    {
                        $cond: {
                            if: {
                                $eq: [{
                                    $arrayElemAt: [{
                                        $arrayElemAt: ["$challenge_data.peserta.caraGabung", 0]
                                    }, 0]
                                }, "SEMUA PENGGUNA"]
                            },
                            then: "$joined",
                            else:
                            {
                                $cond: {
                                    if: {
                                        $in: ["$joinUser._id", {
                                            $arrayElemAt: ["$challenge_data.listParticipant", 0]
                                        }]
                                    },
                                    else: "NOT ALLOWED",
                                    then: "ALLOWED"
                                }
                            },

                        },

                    },
                    "challenge_data": 1,
                    subChallenges: 1,
                    //testColi: "$getlastrank.isUserLogin",
                    scoreStatus:
                    {
                        "$switch":
                        {
                            branches:
                                [
                                    {
                                        case:
                                        {
                                            $eq: ["$status", "AKAN DATANG"]
                                        },
                                        then: 1
                                    },
                                    {
                                        case:
                                        {
                                            $eq: ["$status", "BERLANGSUNG"]
                                        },
                                        then: 2
                                    },
                                    {
                                        case:
                                        {
                                            $eq: ["$status", "BERAKHIR"]
                                        },
                                        then: 0
                                    },

                                ],
                            default: 0
                        }
                    },

                }
            },
            {
                $sort: {
                    scoreStatus: - 1,
                    session: 1
                }
            },
            {
                $limit: 1
            }
        );

        if (status !== undefined) {
            pipeline.push(
                {
                    $match: {
                        status: status
                    }
                }
            );
        }
        if (session !== undefined) {
            pipeline.push(
                {
                    $match: {
                        session: session
                    }
                }
            );
        }

        var query = await this.subChallengeReadModel.aggregate(pipeline);
        return query;
    }


    async getListUserChallengekeduaNew3(idchallenge: string, iduser: string, status: string, session: number) {
        var pipeline = [];

        pipeline.push(
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
                    challengeId: new mongoose.Types.ObjectId(idchallenge)
                },

            },
            {
                "$lookup":
                {
                    from: "userChallenge",
                    let:
                    {
                        userchallenge_fk: "$_id"
                    },
                    as: 'getlastrank',
                    pipeline:
                        [
                            {
                                $match: {
                                    $and: [
                                        {
                                            "$expr":
                                            {
                                                "$eq":
                                                    [
                                                        "$$userchallenge_fk",
                                                        "$idSubChallenge"
                                                    ]
                                            }
                                        },
                                        {
                                            isActive: true
                                        },
                                    ]
                                }
                            },
                            {
                                $sort: {
                                    score: - 1
                                }
                            },
                            {
                                $setWindowFields: {
                                    partitionBy: "$$userchallenge_fk",
                                    sortBy: {
                                        score: - 1
                                    },
                                    output: {
                                        rankNew: {
                                            $documentNumber: {}
                                        }
                                    }
                                }
                            },
                            {
                                "$match":
                                {
                                    $or:
                                        [
                                            {
                                                "$and":
                                                    [
                                                        {
                                                            "$expr":
                                                            {
                                                                "$eq":
                                                                    [
                                                                        "$$userchallenge_fk",
                                                                        "$idSubChallenge"
                                                                    ]
                                                            }
                                                        },
                                                        {
                                                            isActive: true
                                                        },
                                                        {
                                                            score: {
                                                                $ne: 0
                                                            }
                                                        },
                                                        {
                                                            score: {
                                                                $ne: null
                                                            }
                                                        },

                                                    ]
                                            },
                                            {
                                                "$and":
                                                    [
                                                        {
                                                            "$expr":
                                                            {
                                                                "$eq":
                                                                    [
                                                                        "$$userchallenge_fk",
                                                                        "$idSubChallenge"
                                                                    ]
                                                            }
                                                        },
                                                        {
                                                            idUser: new mongoose.Types.ObjectId(iduser)
                                                        },
                                                        {
                                                            isActive: true
                                                        },
                                                        {
                                                            score: {
                                                                $ne: 0
                                                            }
                                                        },
                                                        {
                                                            score: {
                                                                $ne: null
                                                            }
                                                        },

                                                    ]
                                            }
                                        ]
                                }
                            },

                            {
                                $project: {
                                    "_id": 1,
                                    "idSubChallenge": 1,
                                    "idUser": 1,
                                    "ranking": "$rankNew",
                                    "score": 1,
                                    //"history": 1,
                                    "isUserLogin": 1,
                                    "celeng": 1,
                                    "postChallengess": 1,
                                    "objectChallenge": 1,
                                    "username": 1,
                                    "email": 1,
                                    "avatar": 1,
                                    "currentstatistik": 1,
                                    "winnerBadge": 1,
                                    "winnerBadgeOther": 1,

                                }
                            },
                            {
                                $set: {
                                    userID: new mongoose.Types.ObjectId(iduser)
                                }
                            },
                            {
                                $set: {
                                    isUserLogin:
                                    {
                                        "$cond":
                                        {
                                            if:
                                            {
                                                "$eq":
                                                    ["$userID", "$idUser"]
                                            },
                                            then: true,
                                            else: false
                                        }
                                    },

                                }
                            },
                            {
                                "$sort":
                                {
                                    isUserLogin: - 1,
                                    ranking: 1
                                }
                            },
                            {
                                $limit: 11
                            },
                            //{
                            //    $set: {
                            //        lemburTai: 
                            //        {
                            //            $sortArray: {
                            //                input: "$history",
                            //                sortBy: {
                            //                    updatedAt: - 1
                            //                }
                            //            }
                            //        }
                            //    }
                            //},
                            //{
                            //    $set: {
                            //        lastRank: 
                            //        {
                            //            $ifNull: 
                            //            [
                            //                //$arrayElemAt: ["$history.ranking", 0] 
                            //                {
                            //                    $arrayElemAt: ["$lemburTai.ranking", 0]
                            //                },
                            //                0
                            //            ]
                            //        }
                            //    }
                            //},
                            {
                                "$lookup":
                                {
                                    from: "userbasics",
                                    let:
                                    {
                                        basic_fk: "$idUser",

                                    },
                                    as: 'userbasic_data',
                                    pipeline:
                                        [
                                            {
                                                "$match":
                                                {
                                                    "$expr":
                                                    {
                                                        "$eq":
                                                            [
                                                                "$_id",
                                                                "$$basic_fk"
                                                            ]
                                                    }
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "userauths",
                                                    let:
                                                    {
                                                        basic_fk: "$email"
                                                    },
                                                    as: 'userauth_data',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$email",
                                                                                            "$$basic_fk"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "challenge",
                                                    let:
                                                    {
                                                        idChallenge: new mongoose.Types.ObjectId(idchallenge)
                                                    },
                                                    as: 'challenge',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$email",
                                                                                            "$$basic_fk"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                "$project":
                                                {
                                                    _id: 1,
                                                    email: 1,
                                                    username:
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$userauth_data.username",
                                                                0
                                                            ]
                                                    },
                                                    avatar:
                                                    {
                                                        mediaEndpoint:
                                                        {
                                                            "$concat":
                                                                [
                                                                    "/profilepict/",
                                                                    "$profilePict.$id",

                                                                ]
                                                        }
                                                    },

                                                }
                                            }
                                        ]
                                }
                            },
                            {
                                "$lookup":
                                {
                                    from: "challenge",
                                    let:
                                    {
                                        idChallenge: new mongoose.Types.ObjectId(idchallenge)
                                    },
                                    as: 'challenges',
                                    pipeline:
                                        [
                                            {
                                                "$match":
                                                {
                                                    "$and":
                                                        [
                                                            {
                                                                "$expr":
                                                                {
                                                                    "$eq":
                                                                        [
                                                                            "$_id",
                                                                            "$$idChallenge"
                                                                        ]
                                                                },

                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "badge",
                                                    let:
                                                    {
                                                        idBadge: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$ketentuanHadiah.badge.juara1", 0]
                                                            }, 0]
                                                        },

                                                    },
                                                    as: 'winner1',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$_id",
                                                                                            "$$idBadge"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "badge",
                                                    let:
                                                    {
                                                        idBadge: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$ketentuanHadiah.badge.juara2", 0]
                                                            }, 0]
                                                        },

                                                    },
                                                    as: 'winner2',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$_id",
                                                                                            "$$idBadge"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "badge",
                                                    let:
                                                    {
                                                        idBadge: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$ketentuanHadiah.badge.juara3", 0]
                                                            }, 0]
                                                        },

                                                    },
                                                    as: 'winner3',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$_id",
                                                                                            "$$idBadge"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                $set: {
                                                    likes: [
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.suka.HyppeVid", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "vid",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.suka.HyppePic", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "pict",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.suka.HyppeDiary", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "diary",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        //view
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.tonton.HyppeVid", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "vid",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.tonton.HyppePic", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "pict",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.tonton.HyppeDiary", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "diary",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        //post
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.buatKonten.HyppeVid", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "vid",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.buatKonten.HyppePic", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "pict",
                                                                else: "kusnurudin"
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: {
                                                                    $gt: [{
                                                                        $arrayElemAt: [{
                                                                            $arrayElemAt: [{
                                                                                $arrayElemAt: ["$metrik.InteraksiKonten.buatKonten.HyppeDiary", 0]
                                                                            }, 0]
                                                                        }, 0]
                                                                    }, 0]
                                                                },
                                                                then: "diary",
                                                                else: "kusnurudin"
                                                            }
                                                        },

                                                    ]
                                                }
                                            },
                                            // {
                                            //     $facet: {
                                            //         metrik: [
                                            //             {
                                            //                 $group: {
                                            //                     _id: "$likes"
                                            //                 }
                                            //             }
                                            //         ]
                                            //     }
                                            // },
                                            // {
                                            //     $set: {
                                            //         metrikAja: {
                                            //             $setUnion: [
                                            //                 {
                                            //                     $arrayElemAt: ["$metrik._id", 0]
                                            //                 },
                                            //                 {
                                            //                     $arrayElemAt: ["$metrik._id", 0]
                                            //                 }
                                            //             ],

                                            //         }
                                            //     }
                                            // }
                                            {
                                                $set: {
                                                    metrikAja: {
                                                        $reduce: {
                                                            input: "$likes",
                                                            initialValue: [],
                                                            in: {
                                                                $cond: [
                                                                    {
                                                                        $in: [
                                                                            "$$this",
                                                                            "$$value"
                                                                        ]
                                                                    },
                                                                    "$$value",
                                                                    {
                                                                        $concatArrays: [
                                                                            "$$value",
                                                                            [
                                                                                "$$this"
                                                                            ]
                                                                        ]
                                                                    }
                                                                ]
                                                            }
                                                        }
                                                    }
                                                }
                                            },

                                        ],

                                }
                            },
                            {
                                $lookup: {
                                    from: "postChallenge",
                                    let:
                                    {
                                        idSubChallenges: "$idSubChallenge",
                                        idUsers: "$idUser",
                                        emails: {
                                            "$arrayElemAt":
                                                [
                                                    "$userbasic_data.email",
                                                    0
                                                ]
                                        },
                                        metriks: {
                                            $arrayElemAt: ["$challenges.metrikAja", 0]
                                        }
                                    },
                                    as: 'postChallenges',
                                    pipeline:
                                        [
                                            {
                                                $match: {
                                                    $and: [
                                                        {
                                                            "$expr":
                                                            {
                                                                "$eq":
                                                                    [
                                                                        "$idSubChallenge",
                                                                        "$$idSubChallenges"
                                                                    ]
                                                            },

                                                        },
                                                        {
                                                            "$expr":
                                                            {
                                                                "$eq":
                                                                    [
                                                                        "$idUser",
                                                                        "$$idUsers"
                                                                    ]
                                                            },

                                                        },
                                                        {
                                                            "$expr":
                                                            {
                                                                "$in":
                                                                    [
                                                                        "$postType",
                                                                        "$$metriks"
                                                                    ]
                                                            },
                                                            //
                                                        },

                                                    ]
                                                },

                                            },
                                            {
                                                $sort: {
                                                    score: - 1,
                                                    updatedAt: 1,

                                                }
                                            },
                                            {
                                                $limit: 1
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "posts",
                                                    let:
                                                    {
                                                        idPost: "$postID"
                                                    },
                                                    as: 'posted',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$postID",
                                                                                            "$$idPost"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },

                                                        ]
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$posted"
                                                }
                                            },
                                            {
                                                "$lookup":
                                                {
                                                    from: "posts",
                                                    let:
                                                    {
                                                        idPost: "$postID",
                                                        type: "$posted.postType",
                                                        emails: "$$emails"
                                                    },
                                                    as: 'index',
                                                    pipeline:
                                                        [
                                                            {
                                                                "$match":
                                                                {
                                                                    "$and":
                                                                        [
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$postType",
                                                                                            "$$type"
                                                                                        ]
                                                                                },

                                                                            },
                                                                            {
                                                                                "active": true,
                                                                            },
                                                                            {
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$email",
                                                                                            "$$emails"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },
                                                            {
                                                                $setWindowFields: {
                                                                    partitionBy: "$postType",
                                                                    sortBy: {
                                                                        createdAt: - 1
                                                                    },
                                                                    output: {
                                                                        numbers: {
                                                                            $documentNumber: {}
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
                                                                                "$expr":
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$postID",
                                                                                            "$$idPost"
                                                                                        ]
                                                                                },

                                                                            },

                                                                        ]
                                                                }
                                                            },
                                                            {
                                                                $project: {
                                                                    numbers: 1
                                                                }
                                                            }
                                                        ]
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$index"
                                                }
                                            },
                                            {
                                                $project: {
                                                    metriks: "$$metriks",
                                                    score: 1,
                                                    likes: 1,
                                                    postID: "$posted.postID",
                                                    description: "$posted.description",
                                                    postType: "$posted.postType",
                                                    apsaraId: "$posted.apsaraId",
                                                    mediaThumbEndpoint: {
                                                        "$concat": ["/thumb/", "$posted.postID"]
                                                    },
                                                    mediaThumbUri: "$mediaThumb",
                                                    apsaraThumbId: "$posted.apsaraThumbId",
                                                    index: "$index.numbers",

                                                }
                                            },

                                        ]
                                }
                            },
                            {
                                "$project":
                                {
                                    celeng: {
                                        $arrayElemAt: ["$challenges.metrikAja", 0]
                                    },
                                    postChallengess: "$postChallenges",
                                    objectChallenge: "$challenges.objectChallenge",
                                    idUser: 1,
                                    score: 1,
                                    ranking: 1,
                                    lastRank: 1,
                                    idSubChallenge: 1,
                                    // history: //"$lemburTai",
                                    // {
                                    //     $arrayElemAt: ["$lemburTai", 0]
                                    // },
                                    username:
                                    {
                                        "$arrayElemAt":
                                            [
                                                "$userbasic_data.username",
                                                0
                                            ]
                                    },
                                    email:
                                    {
                                        "$arrayElemAt":
                                            [
                                                "$userbasic_data.email",
                                                0
                                            ]
                                    },
                                    avatar:
                                    {
                                        "$arrayElemAt":
                                            [
                                                "$userbasic_data.avatar",
                                                0
                                            ]
                                    },
                                    currentstatistik:
                                    {
                                        "$switch":
                                        {
                                            branches:
                                                [
                                                    {
                                                        case:
                                                        {
                                                            $gt: ["$ranking", "$lastRank"]
                                                        },
                                                        then: "NETRAL"
                                                    },
                                                    {
                                                        case:
                                                        {
                                                            $lt: ["$ranking", "$lastRank"]
                                                        },
                                                        then: "NETRAL"
                                                    },

                                                ],
                                            default: "NETRAL"
                                        }
                                    },
                                    isUserLogin: 1,
                                    winnerBadge:
                                    {
                                        "$switch":
                                        {
                                            branches:
                                                [
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 1]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner1.badgeProfile", 0]
                                                            }, 0]
                                                        }
                                                    },
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 2]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner2.badgeProfile", 0]
                                                            }, 0]
                                                        }
                                                    },
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 3]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner3.badgeProfile", 0]
                                                            }, 0]
                                                        }
                                                    },

                                                ],
                                            default: "Anda Kurang Beruntung.. COBA LAGI !!!"
                                        }
                                    },
                                    winnerBadgeOther:
                                    {
                                        "$switch":
                                        {
                                            branches:
                                                [
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 1]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner1.badgeOther", 0]
                                                            }, 0]
                                                        }
                                                    },
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 2]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner2.badgeOther", 0]
                                                            }, 0]
                                                        }
                                                    },
                                                    {
                                                        case:
                                                        {
                                                            $eq: ["$ranking", 3]
                                                        },
                                                        then: {
                                                            $arrayElemAt: [{
                                                                $arrayElemAt: ["$challenges.winner3.badgeOther", 0]
                                                            }, 0]
                                                        }
                                                    },

                                                ],
                                            default: "Anda Kurang Beruntung.. COBA LAGI !!!"
                                        }
                                    },

                                }
                            },
                            {
                                $sort: {
                                    ranking: 1
                                }
                            },

                        ]
                },

            },
            {
                "$lookup": {
                    from: "userbasics",
                    as: "joinUser",
                    let: {
                        localID: new mongoose.Types.ObjectId(iduser)
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ["$_id", "$$localID"]
                                        },

                                    ]
                                }
                            }
                        },

                    ],

                }
            },
            {
                "$lookup": {
                    from: "challenge",
                    as: "peserta",
                    let: {
                        localID: new mongoose.Types.ObjectId(idchallenge)
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ["$_id", "$$localID"]
                                        },

                                    ]
                                }
                            }
                        },
                        //{
                        //		$set:{
                        //				kelaminya:[
                        //						{
                        //                $cond: {
                        //                    if :{
                        //                        $eq: [{
                        //                            $arrayElemAt: [{
                        //                                $arrayElemAt: ["$peserta.peserta.jenisKelamin.Laki-Laki", 0]
                        //                            }, 0]
                        //                        }, "YES"]
                        //                    },
                        //                    then: "Laki-Laki",
                        //                    else : "kusnurudin"
                        //									}
                        //							},
                        //						{
                        //                $cond: {
                        //                    if :{
                        //                        $eq: [{
                        //                            $arrayElemAt: [{
                        //                                $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                        //                            }, 0]
                        //                        }, "YES"]
                        //                    },
                        //                    then: "PEREMPUAN",
                        //                    else : "kusnurudin"
                        //									}
                        //							},
                        //						{
                        //                $cond: {
                        //                    if :{
                        //                        $eq: [{
                        //                            $arrayElemAt: [{
                        //                                $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                        //                            }, 0]
                        //                        }, "YES"]
                        //                    },
                        //                    then: "OTHER",
                        //                    else : "kusnurudin"
                        //									}
                        //							},
                        //				]
                        //		}
                        //},
                    ],

                }
            },
            {
                $set:
                {
                    co: ["MALE", "Male", " MALE", "Laki-laki", "Pria"]
                },

            },
            {
                $set:
                {
                    ce:
                        ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita"]
                }
            },
            {
                $set:
                {
                    all: ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita", "MALE", "Male", " MALE", "Laki-laki", "Pria", "Other"]
                }
            },
            {
                $set:
                {
                    ceOther: ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita", "Other"]
                }
            },
            {
                $set:
                {
                    coOther: ["MALE", " MALE", "Male", "Laki-laki", "Pria", "Other"]
                }
            },
            {
                $set:
                {
                    ceCo: ["FEMALE", "Female", " FEMALE", "Perempuan", "Wanita", "Male", "MALE", " MALE", "Laki-laki", "Pria"]
                }
            },
            {
                $set:
                {
                    other: ["Other"]
                }
            },
            {
                $unwind: {
                    path: "$peserta"
                }
            },
            {
                $unwind: {
                    path: "$joinUser"
                }
            },
            {
                $set: {
                    kelamin:
                    {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: "$ce"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: "$co"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: "$other"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: "$ceCo"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: "$coOther"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: "$coOther"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: "$ceOther"
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.LAKI-LAKI", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.PEREMPUAN", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.jenisKelamin.OTHER", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: "$all"
                                },

                            ],
                            default: "kancut"
                        }
                    },

                }
            },
            {
                $set: {
                    verified: {
                        $cond: {
                            if: {
                                $eq: [{
                                    $arrayElemAt: ["$peserta.peserta.tipeAkunTerverikasi", 0]
                                }, "ALL"]
                            },
                            then: true,
                            else: {
                                $cond: {
                                    if: {
                                        $eq: [{
                                            $arrayElemAt: ["$peserta.peserta.tipeAkunTerverikasi", 0]
                                        }, "YES"]
                                    },
                                    else: {
                                        $cond: {
                                            if: {
                                                $eq: [{
                                                    $arrayElemAt: ["$peserta.peserta.tipeAkunTerverikasi", 0]
                                                }, "NO"]
                                            },
                                            then: {
                                                $cond: {
                                                    if: {
                                                        $eq: ["$joinUser.isIdVerified", false]
                                                    },
                                                    then: true,
                                                    else: false
                                                }
                                            },
                                            else: false
                                        }
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $eq: ["$joinUser.isIdVerified", true]
                                            },
                                            then: true,
                                            else: false
                                        }
                                    }
                                }
                            }
                        },

                    },

                }
            },
            {
                $set: {
                    age:
                    {
                        $cond: {
                            if: {
                                $and: ['$joinUser.dob', {
                                    $ne: ["$joinUser.dob", ""]
                                }]
                            },
                            then: {
                                $toInt: {
                                    $divide: [{
                                        $subtract: [new Date(), {
                                            $toDate: "$joinUser.dob"
                                        }]
                                    }, (365 * 24 * 60 * 60 * 1000)]
                                }
                            },
                            else: 0
                        }
                    },

                }
            },
            {
                $set: {

                    ageChallenge:
                    {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: [0, 14]
                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $lte: ["$age", 28]
                                            },
                                            else: "error umur 28",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $lte: ["$age", 43]
                                            },
                                            else: "error umur <43",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $lte: ["$age", 100000]
                                            },
                                            else: "error umur >43",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    {
                                                        $lte: ["$age", 100000]
                                                    },
                                                    {
                                                        $gt: ["$age", 14]
                                                    }
                                                ]
                                            },
                                            else: "error umur 14-1000",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    {
                                                        $lte: ["$age", 100000]
                                                    },
                                                    {
                                                        $gt: ["$age", 28]
                                                    }
                                                ]
                                            },
                                            else: "error umur 28-1000",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    {
                                                        $lte: ["$age", 100000]
                                                    },
                                                    {
                                                        $gt: ["$age", 43]
                                                    }
                                                ]
                                            },
                                            else: "error umur 43-1000",
                                            then: true,

                                        }
                                    },

                                },
                                //beda case//
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $or: [
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 14]
                                                            },
                                                            {
                                                                $gt: ["$age", 0]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 100000]
                                                            },
                                                            {
                                                                $gt: ["$age", 28]
                                                            }
                                                        ]
                                                    },

                                                ]
                                            },
                                            else: "error umur 0,28,1000",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $or: [
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 14]
                                                            },
                                                            {
                                                                $gt: ["$age", 0]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 100000]
                                                            },
                                                            {
                                                                $gt: ["$age", 43]
                                                            }
                                                        ]
                                                    },

                                                ]
                                            },
                                            else: "error umur 0,43,1000",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $or: [
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 28]
                                                            },
                                                            {
                                                                $gt: ["$age", 14]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 100000]
                                                            },
                                                            {
                                                                $gt: ["$age", 43]
                                                            }
                                                        ]
                                                    },

                                                ]
                                            },
                                            else: "error umur 0,43,1000",
                                            then: true,

                                        }
                                    },

                                },
                                {
                                    case: {
                                        $and: [
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.<14", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.14-28", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.29-43", 0]
                                                    }, 0]
                                                }, "NO"]
                                            },
                                            {
                                                $eq: [{
                                                    $arrayElemAt: [{
                                                        $arrayElemAt: ["$peserta.peserta.rentangUmur.44<", 0]
                                                    }, 0]
                                                }, "YES"]
                                            },

                                        ]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $or: [
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 28]
                                                            },
                                                            {
                                                                $gt: ["$age", 0]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        $and: [
                                                            {
                                                                $lte: ["$age", 100000]
                                                            },
                                                            {
                                                                $gt: ["$age", 43]
                                                            }
                                                        ]
                                                    },

                                                ]
                                            },
                                            else: "error umur 0,43,1000",
                                            then: true,

                                        }
                                    },

                                },

                            ],
                            "default": 10000
                        }
                    }
                }
            },
            {
                $project:
                {
                    postChallengess: "$postChallenges",
                    ageChallenge: 1,
                    age: 1,
                    kelamin: 1,
                    joinUser: 1,
                    "_id": 1,
                    "challengeId": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "isActive": 1,
                    "session": 1,
                    "timenow": 1,
                    "getlastrank": 1,
                    "status": {
                        $cond: {
                            if: {
                                $and: [
                                    {
                                        $lte:
                                            [
                                                "$timenow",
                                                "$endDatetime",

                                            ]
                                    },
                                    {
                                        $gte:
                                            [
                                                "$timenow",
                                                "$startDatetime",

                                            ]
                                    },

                                ]
                            },
                            then: "BERLANGSUNG",
                            else:
                            {
                                $cond: {
                                    if: {
                                        $and: [
                                            {
                                                $lt:
                                                    [
                                                        "$endDatetime",
                                                        "$timenow",

                                                    ]
                                            },

                                        ]
                                    },
                                    else: "AKAN DATANG",
                                    then: "BERAKHIR"
                                }
                            },

                        }
                    },
                    "joined":
                    {
                        $cond: {
                            if: {
                                $in: [true, "$getlastrank.isUserLogin"]
                            },
                            then: "JOINED",
                            else: {
                                $cond: {
                                    if: {
                                        $eq: [{
                                            $arrayElemAt: ["$peserta.peserta.caraGabung", 0]
                                        }, "SEMUA PENGGUNA"]
                                    },
                                    then:
                                    {
                                        $cond: {
                                            if: {
                                                $eq: ["$verified", true]
                                            },
                                            else: "NOT ALLOWED",
                                            then:
                                            {
                                                $cond: {
                                                    if: {
                                                        $in: ["$joinUser.gender", "$kelamin"]
                                                    },
                                                    else: "NOT ALLOWED",
                                                    then:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $eq: ["$ageChallenge", true]
                                                            },
                                                            else: "NOT ALLOWED",
                                                            then:
                                                            {
                                                                $cond: {
                                                                    if: {
                                                                        $in: ["$joinUser.states.$id", {
                                                                            $arrayElemAt: ["$peserta.peserta.lokasiPengguna", 0]
                                                                        }]
                                                                    },
                                                                    else: "NOT ALLOWED",
                                                                    then: "ALLOWED"
                                                                }
                                                            },

                                                        }
                                                    }
                                                }
                                            },

                                        },

                                    },
                                    else: "NOT ALLOWED"
                                }
                            },

                        }
                    },

                }
            },
            {
                "$lookup": {
                    "from": "challenge",
                    "as": "challenge_data",
                    "let": {
                        "local_id": "$challengeId"
                    },
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$eq": ["$_id", "$$local_id"]
                                }
                            }
                        },
                        {
                            $project: {
                                "_id": 1,
                                "nameChallenge": 1,
                                "jenisChallenge": 1,
                                "description": 1,
                                "createdAt": 1,
                                "updatedAt": 1,
                                "durasi": 1,
                                "startChallenge": 1,
                                "endChallenge": 1,
                                "startTime": 1,
                                "endTime": 1,
                                "jenisDurasi": 1,
                                "tampilStatusPengguna": 1,
                                "objectChallenge": 1,
                                "statusChallenge": 1,
                                "metrik": 1,
                                "peserta": 1,
                                "leaderBoard": 1,
                                "ketentuanHadiah": 1,
                                "hadiahPemenang": 1,
                                "bannerSearch": 1,
                                "popUp": 1,
                                "notifikasiPush": 1,
                                "listParticipant": 1
                            }
                        }
                    ]
                }
            },
            {
                "$lookup": {
                    from: "subChallenge",
                    as: "subChallenges",
                    let: {
                        localID: '$challengeId',
                        timeNow: "$timenow",

                    },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    {
                                        $expr:
                                        {
                                            $eq: ["$challengeId", "$$localID"]
                                        },

                                    },
                                    {
                                        $expr:
                                        {
                                            $gte:
                                                [
                                                    "$$timeNow",
                                                    "$endDatetime",

                                                ]
                                        },

                                    },

                                ]
                            }
                        },
                        {
                            $set:
                            {
                                tahun:
                                {
                                    $year: {
                                        $toDate: "$startDatetime"
                                    }
                                }
                            }
                        },
                        {
                            $set:
                            {
                                bulan:
                                {
                                    $month: {
                                        $toDate: "$startDatetime"
                                    }
                                }
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    bulan: "$bulan",
                                    tahun: "$tahun"
                                },
                                "detail": {
                                    $push: "$$ROOT"
                                },

                            }
                        },
                        {
                            $unwind: {
                                path: "$_id"
                            }
                        },
                        {
                            $project: {
                                _id: "$kampret",
                                bulan: "$_id.bulan",
                                tahun: "$_id.tahun",
                                detail: "$detail",

                            }
                        },
                        {
                            $sort: {

                                'detail.bulan': 1
                            }
                        },
                        {
                            $group: {
                                _id: "$tahun",
                                "detail": {
                                    $push: "$$ROOT"
                                },

                            }
                        },
                        {
                            $project: {
                                _id: "$kampret",
                                tahun: "$_id",
                                detail: "$detail",

                            }
                        },
                        {
                            $sort: {
                                tahun: 1,

                            }
                        },

                    ],

                }
            },
            {
                $project:
                {
                    ageChallenge: 1,
                    age: 1,
                    kelamin: 1,
                    //tester: "$joinUser",
                    "_id": 1,
                    "challengeId": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "isActive": 1,
                    "session": 1,
                    "timenow": 1,
                    "getlastrank": 1,
                    "status": 1,
                    //"joined": 1,
                    "joined":
                    {
                        $cond: {
                            if: {
                                $eq: [{
                                    $arrayElemAt: [{
                                        $arrayElemAt: ["$challenge_data.peserta.caraGabung", 0]
                                    }, 0]
                                }, "SEMUA PENGGUNA"]
                            },
                            then: "$joined",
                            else:
                            {
                                $cond: {
                                    if: {
                                        $in: ["$joinUser._id", {
                                            $arrayElemAt: ["$challenge_data.listParticipant", 0]
                                        }]
                                    },
                                    else: "NOT ALLOWED",
                                    then: "ALLOWED"
                                }
                            },

                        },

                    },
                    "challenge_data": 1,
                    subChallenges: 1,
                    //testColi: "$getlastrank.isUserLogin",
                    scoreStatus:
                    {
                        "$switch":
                        {
                            branches:
                                [
                                    {
                                        case:
                                        {
                                            $eq: ["$status", "AKAN DATANG"]
                                        },
                                        then: 1
                                    },
                                    {
                                        case:
                                        {
                                            $eq: ["$status", "BERLANGSUNG"]
                                        },
                                        then: 2
                                    },
                                    {
                                        case:
                                        {
                                            $eq: ["$status", "BERAKHIR"]
                                        },
                                        then: 0
                                    },

                                ],
                            default: 0
                        }
                    },

                }
            },
            {
                $sort: {
                    scoreStatus: - 1,
                    session: 1
                }
            },

            // {
            //     $limit: 1
            // }
        );
        if (status !== undefined) {
            pipeline.push(
                {
                    $match: {
                        status: status
                    }
                }
            );
        }
        if (session !== undefined) {
            pipeline.push(
                {
                    $match: {
                        session: session
                    }
                }
            );
        }

        var query = await this.subChallengeReadModel.aggregate(pipeline);
        return query;
    }
}
