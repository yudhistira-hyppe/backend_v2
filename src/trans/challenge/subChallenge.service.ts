import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { subChallenge, subchallengeDocument } from './schemas/subchallenge.schema';
import { CreateSubChallengeDto } from './dto/create-subchallenge.dto';
import { pipeline } from 'stream';

@Injectable()
export class subChallengeService {
    constructor(
        @InjectModel(subChallenge.name, 'SERVER_FULL')
        private readonly subChallengeModel: Model<subchallengeDocument>,
    ) { }

    async create(subchallengedata: CreateSubChallengeDto) {
        const result = await this.subChallengeModel.create(subchallengedata);
        return result;
    }

    async findOne(id: string): Promise<subChallenge> {
        return this.subChallengeModel.findOne({ _id: new Types.ObjectId(id) }).exec();
    }

    async findChild(id: string): Promise<subChallenge[]> {
        return this.subChallengeModel.find({ challengeId: new Types.ObjectId(id) }).exec();
    }

    async find(): Promise<subChallenge[]> {
        return this.subChallengeModel.find().exec();
    }

    async update(id: string, subChallengedata: CreateSubChallengeDto): Promise<subChallenge> {
        let data = await this.subChallengeModel.findByIdAndUpdate(id, subChallengedata, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }

    async delete(id: string) {
        const data = await this.subChallengeModel.findByIdAndRemove({ _id: new Types.ObjectId(id) }).exec();
        return data;
    }

    async findbyid(id: string) {
        var query = await this.subChallengeModel.aggregate([
            {

                $match: {

                    challengeId: new Types.ObjectId(id)
                }
            }

        ]);
        return query;
    }

    async listingleaderboard(challengeId: string, userId: string) {
        var mongo = require('mongoose');
        var konvertChallenge = mongo.Types.ObjectId(challengeId);
        var konvertUser = mongo.Types.ObjectId(userId);

        var data = await this.subChallengeModel.aggregate([
            {
                $set: {
                    "timenow":
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                                $add: [
                                    new Date(),
                                    - 61200000
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
                                challengeId: konvertChallenge
                            },

                        ]
                }
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
                                                        //{
                                                        //    $expr: 
                                                        //    {
                                                        //        $lte: 
                                                        //        [
                                                        //            "$timenow",
                                                        //            "$startDatetime",
                                                        //            
                                                        //        ]
                                                        //    }
                                                        //},
                                                        //{
                                                        //    $expr: 
                                                        //    {
                                                        //        $lte: 
                                                        //        [
                                                        //            "$timenow",
                                                        //            "$startDatetime",
                                                        //            
                                                        //        ]
                                                        //    }
                                                        //},
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
                                                            idUser: konvertUser,

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
                                                        //{
                                                        //    $expr: 
                                                        //    {
                                                        //        $lte: 
                                                        //        [
                                                        //            "$timenow",
                                                        //            "$startDatetime",
                                                        //            
                                                        //        ]
                                                        //    }
                                                        //},
                                                    ]
                                            }
                                        ]
                                }
                            },
                            {
                                $set: {
                                    lastRank: //{$arrayElemAt:[ "$history.ranking", 0]}
                                    {
                                        $ifNull:
                                            [
                                                {
                                                    $arrayElemAt: ["$history.ranking", 0]
                                                },
                                                0
                                            ]
                                    }
                                }
                            },
                            {
                                $set: {
                                    userID: konvertUser,

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
                                                        idChallenge: konvertChallenge
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
                                        idChallenge: konvertChallenge
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

                                        ],

                                }
                            },
                            {
                                "$project":
                                {
                                    //challeges: {$arrayElemAt:[ "$challenges.winner1",0]},
                                    //{
                                    //    $arrayElemAt: ["$challenges.juara1", 0]
                                    //},
                                    idUser: 1,
                                    score: 1,
                                    ranking: 1,
                                    lastRank: 1,
                                    idSubChallenge: 1,
                                    history: 1,
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
                                                        then: "UP"
                                                    },
                                                    {
                                                        case:
                                                        {
                                                            "$gt": ["$lastRank", "$ranking"]
                                                        },
                                                        then: "DOWN"
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
                        localID: konvertUser,

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
                        localID: konvertChallenge,

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
                $set:
                {
                    co: ["MALE", " MALE", "Laki-laki", "Pria"]
                },

            },
            {
                $set:
                {
                    ce:
                        ["FEMALE", " FEMALE", "Perempuan", "Wanita"]
                }
            },
            {
                $set:
                {
                    all: ["FEMALE", " FEMALE", "Perempuan", "Wanita", "MALE", " MALE", "Laki-laki", "Pria", "Other"]
                }
            },
            {
                $set:
                {
                    ceOther: ["FEMALE", " FEMALE", "Perempuan", "Wanita", "Other"]
                }
            },
            {
                $set:
                {
                    coOther: ["MALE", " MALE", "Laki-laki", "Pria", "Other"]
                }
            },
            {
                $set:
                {
                    ceCo: ["FEMALE", " FEMALE", "Perempuan", "Wanita", "MALE", " MALE", "Laki-laki", "Pria"]
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
                            else: "BERAKHIR"
                        }
                    },
                    "joined":
                    {
                        $cond: {
                            if: {
                                $eq: [{
                                    $arrayElemAt: ["$getlastrank.isUserLogin", 10]
                                }, true]
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
                                            then: {
                                                $cond: {
                                                    if: {
                                                        $eq: ["$ads.kelamin", "$joinUser.gender"]
                                                    },
                                                    else: "NOT ALLOWED",
                                                    then: {
                                                        $cond: {
                                                            if: {
                                                                $eq: ["$ageChallenge", true]
                                                            },
                                                            else: "NOT ALLOWED",
                                                            then: {
                                                                $cond: {
                                                                    if: {
                                                                        $eq: [{
                                                                            $arrayElemAt: ["$peserta.peserta.lokasiPengguna", 0]
                                                                        }, "$joinUser.states.$id"]
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
        ]);

        return data;
    }

    async getwilayahpengguna(challengeid: string) {
        var mongo = require('mongoose');
        var konvertid = mongo.Types.ObjectId(challengeid);

        var data = await this.subChallengeModel.aggregate([
            {
                "$match":
                {
                    challengeId: konvertid
                }
            },
            {
                "$lookup":
                {
                    from: "userChallenge",
                    as: "userChallenge_data",
                    let:
                    {
                        userChallenge_fk: "$_id",
                    },
                    pipeline: [
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
                                                        "$$userChallenge_fk", "$idSubChallenge"
                                                    ]
                                            }
                                        }
                                    ],
                            }
                        },
                        {
                            "$lookup":
                            {
                                from: "userbasics",
                                as: "userbasics_data",
                                let:
                                {
                                    userbasic_fk: "$idUser"
                                },
                                pipeline: [
                                    {
                                        "$match":
                                        {
                                            "$expr":
                                            {
                                                "$eq":
                                                    [
                                                        "$_id", "$$userbasic_fk"
                                                    ]
                                            }
                                        },
                                    },
                                    {
                                        "$project":
                                        {
                                            _id: 1,
                                            states: "$states.$id"
                                            // states:1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "$project":
                            {
                                _id: 1,
                                idUser: 1,
                                wilayah:
                                {
                                    "$arrayElemAt":
                                        [
                                            "$userbasics_data.states", 0
                                        ]
                                }
                            }
                        },
                        // {
                        //     "$match":
                        //     {
                        //         wilayah:
                        //         {
                        //             "$exists":true
                        //         }
                        //     }
                        // }
                        {
                            "$lookup":
                            {
                                "from": "areas",
                                "as": "listdaerah",
                                "let": {
                                    "area_fk": "$wilayah"
                                },
                                "pipeline":
                                    [
                                        {
                                            "$match":
                                            {
                                                "$expr":
                                                {
                                                    "$eq": ["$_id", "$$area_fk"]
                                                }
                                            }
                                        },
                                    ]
                            }
                        },
                        {
                            "$project":
                            {
                                _id: 0,
                                areas_name:
                                {
                                    "$arrayElemAt":
                                        [
                                            "$listdaerah.stateName", 0
                                        ]
                                }
                            }
                        },
                        {
                            "$group":
                            {
                                _id:
                                {
                                    "$ifNull":
                                        [
                                            "$areas_name",
                                            "Lainnya"
                                        ]
                                },
                                total:
                                {
                                    "$sum": 1
                                }
                            }
                        },
                        {
                            "$group":
                            {
                                _id: null,
                                totaldata:
                                {
                                    "$sum": "$total"
                                },
                                data:
                                {
                                    "$push":
                                    {
                                        _id: "$_id",
                                        total: "$total"
                                    }
                                }
                            }
                        },
                        {
                            "$unwind":
                            {
                                path: "$data"
                            }
                        },
                        {
                            "$sort":
                            {
                                _id: 1
                            }
                        },
                        {
                            "$project":
                            {
                                _id: "$data._id",
                                //total:{}"$data.total",
                                persentase:
                                {
                                    "$multiply":
                                        [
                                            {
                                                "$divide":
                                                    [
                                                        "$data.total", "$totaldata"
                                                    ]
                                            }, 100
                                        ]
                                }
                            }
                        },
                        {
                            "$group":
                            {
                                _id: "$_id",
                                persentase:
                                {
                                    "$first": "$persentase"
                                }
                            }
                        },
                        {
                            "$sort":
                            {
                                _id: 1
                            }
                        }
                    ]
                }
            },
        ]);

        return data;
    }

    async subchallengedetailwithlastrank(challengeId: string) {
        var mongo = require('mongoose');
        var konvertid = mongo.Types.ObjectId(challengeId);

        var query = await this.subChallengeModel.aggregate([
            {
                $match: {

                    challengeId: konvertid
                }
            },
            {
                "$lookup":
                {
                    from: "userChallenge",
                    as: "userChallenge_data",
                    let:
                    {
                        userchallenge_fk: '$_id'
                    },
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
                                                            "$$userchallenge_fk", "$idSubChallenge"
                                                        ]
                                                }
                                            },
                                            {
                                                isActive: true
                                            },
                                            {
                                                ranking:
                                                {
                                                    $ne: 0
                                                }
                                            },
                                            {
                                                ranking:
                                                {
                                                    $ne: null
                                                }
                                            },
                                        ]
                                }
                            },
                            {
                                "$sort":
                                {
                                    ranking: -1,
                                }
                            },
                            {
                                "$limit": 1
                            },
                            {
                                "$project":
                                {
                                    _id: 0,
                                    ranking:
                                    {
                                        "$add":
                                            [
                                                "$ranking",
                                                1
                                            ]
                                    }
                                }
                            }
                        ]
                }
            },
            {
                "$project":
                {
                    _id: 1,
                    challengeId: 1,
                    startDatetime: 1,
                    endDatetime: 1,
                    isActive: 1,
                    session: 1,
                    lastrank:
                    {
                        "$ifNull":
                            [
                                {
                                    "$arrayElemAt":
                                        [
                                            "$userChallenge_data.ranking", 0
                                        ]
                                }
                                , 1
                            ]
                    }
                }
            }
        ]);

        return query;
    }

    async listinguserchallenge(challengeId: string, pilihansession: string, setjenisakun: any[], setusername: string, setstartage: number, setendage: number, setjeniskelamin: any[], sortingranking: boolean, limit: number, page: number) {
        var mongo = require('mongoose');
        var konvertid = mongo.Types.ObjectId(challengeId);

        var pipeline = [];
        pipeline.push(
            {
                $set:
                {
                    "timenow":
                    {
                        "$dateToString":
                        {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date":
                            {
                                $add: [new Date(), 25200000]
                            }
                        }
                    }
                }
            },
        );

        if (pilihansession == "BERLANGSUNG") {
            pipeline.push(
                {
                    "$match":
                    {
                        "$and":
                            [
                                {
                                    challengeId: konvertid
                                },
                                {
                                    "$expr":
                                    {
                                        "$lte":
                                            [
                                                "$startDatetime",
                                                "$timenow"
                                            ]
                                    }
                                },
                                {
                                    "$expr":
                                    {
                                        "$gte":
                                            [
                                                "$endDatetime",
                                                "$timenow"
                                            ]
                                    }
                                },
                            ]
                    }
                },
            );
        }
        else {
            pipeline.push(
                {
                    "$match":
                    {
                        "$and":
                            [
                                {
                                    challengeId: konvertid
                                },
                                {
                                    "$expr":
                                    {
                                        "$lte":
                                            [
                                                "$endDatetime",
                                                "$timenow"
                                            ]
                                    }
                                }
                            ]
                    }
                },
            );
        }

        var userchallengepipeline = [];

        userchallengepipeline.push(
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
                                            "$$userChallenge_fk", "$idSubChallenge"
                                        ]
                                }
                            },
                            {
                                "$expr":
                                {
                                    "$eq":
                                        [
                                            "$isActive", true
                                        ]
                                }
                            },
                        ]
                }
            },
            {
                "$lookup":
                {
                    "from": "userbasics",
                    "localField": "idUser",
                    "foreignField": "_id",
                    "as": "userbasics_data"
                }
            },
            {
                "$lookup":
                {
                    "from": "userauths",
                    "localField": "userbasics_data.email",
                    "foreignField": "email",
                    "as": "userauth_data"
                }
            },
            {
                "$lookup":
                {
                    "from": "mediaprofilepicts",
                    "as": 'avatar',
                    "localField": "userbasics_data.profilePict.$id",
                    "foreignField": "_id",
                }
            },
            {
                "$project":
                {
                    _id: 1,
                    idSubChallenge: 1,
                    startDatetime: 1,
                    endDatetime: 1,
                    updatedAt: 1,
                    score:
                    {
                        "$ifNull":
                            [
                                "$score",
                                0
                            ]
                    },
                    ranking:
                    {
                        "$ifNull":
                            [
                                {
                                    "$toInt": "$ranking"
                                },
                                {
                                    "$toInt": 0
                                }
                            ]
                    },
                    username:
                    {
                        "$arrayElemAt":
                            [
                                "$userauth_data.username", 0
                            ]
                    },
                    email:
                    {
                        "$arrayElemAt":
                            [
                                "$userbasics_data.email", 0
                            ]
                    },
                    fullName:
                    {
                        "$arrayElemAt":
                            [
                                "$userbasics_data.fullName", 0
                            ]
                    },
                    gender:
                    {
                        $switch:
                        {
                            branches:
                                [
                                    {
                                        case: {
                                            $eq: [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$userbasics_data.gender", 0
                                                        ]
                                                },
                                                'FEMALE'
                                            ]
                                        },
                                        then: 'FEMALE',

                                    },
                                    {
                                        case: {
                                            $eq: [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$userbasics_data.gender", 0
                                                        ]
                                                },
                                                ' FEMALE'
                                            ]
                                        },
                                        then: 'FEMALE',

                                    },
                                    {
                                        case: {
                                            $eq: [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$userbasics_data.gender", 0
                                                        ]
                                                },
                                                'Perempuan'
                                            ]
                                        },
                                        then: 'FEMALE',

                                    },
                                    {
                                        case: {
                                            $eq: [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$userbasics_data.gender", 0
                                                        ]
                                                },
                                                'Wanita'
                                            ]
                                        },
                                        then: 'FEMALE',

                                    },
                                    {
                                        case: {
                                            $eq: [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$userbasics_data.gender", 0
                                                        ]
                                                },
                                                'MALE'
                                            ]
                                        },
                                        then: 'MALE',

                                    },
                                    {
                                        case: {
                                            $eq:
                                                [
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$userbasics_data.gender", 0
                                                            ]
                                                    },
                                                    ' MALE'
                                                ]
                                        },
                                        then: 'MALE',

                                    },
                                    {
                                        case: {
                                            $eq: [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$userbasics_data.gender", 0
                                                        ]
                                                },
                                                'Laki-laki'
                                            ]
                                        },
                                        then: 'MALE',

                                    },
                                    {
                                        case: {
                                            $eq: [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$userbasics_data.gender", 0
                                                        ]
                                                },
                                                'Pria'
                                            ]
                                        },
                                        then: 'MALE',

                                    },

                                ],
                            default: "OTHER",
                        },
                    },
                    dob:
                    {
                        $cond:
                        {
                            if:
                            {
                                $and:
                                    [
                                        {
                                            "$arrayElemAt":
                                                [
                                                    "$userbasics_data.dob", 0
                                                ]
                                        },
                                        {
                                            $ne:
                                                [
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$userbasics_data.dob", 0
                                                            ]
                                                    },
                                                    ""
                                                ]
                                        }
                                    ]
                            },
                            then:
                            {
                                $toInt: {
                                    $divide: [{
                                        $subtract: [new Date(), {
                                            $toDate: {
                                                "$arrayElemAt":
                                                    [
                                                        "$userbasics_data.dob", 0
                                                    ]
                                            },
                                        }]
                                    }, (365 * 24 * 60 * 60 * 1000)]
                                }
                            },
                            else: 0
                        }
                    },
                    statusKyc:
                    {
                        "$arrayElemAt":
                            [
                                "$userbasics_data.statusKyc", 0
                            ]
                    },
                    profilePict:
                    {
                        mediaBasePath:
                        {
                            "$ifNull":
                                [
                                    {
                                        "$concat":
                                            [
                                                {
                                                    $arrayElemAt: ['$avatar.mediaBasePath', 0]
                                                },
                                                {
                                                    $arrayElemAt: ['$avatar.mediaUri', 0]
                                                }
                                            ]
                                    },
                                    null
                                ]
                        },
                        mediaUri:
                        {
                            "$ifNull":
                                [
                                    {
                                        $arrayElemAt: ['$avatar.mediaUri', 0]
                                    },
                                    null
                                ]
                        },
                        mediaType:
                        {
                            "$ifNull":
                                [
                                    {
                                        $arrayElemAt: ['$avatar.mediaType', 0]
                                    },
                                    null
                                ]
                        },
                        // mediaEndpoint:
                        // {
                        //   $concat: [
                        //     '/profilepict/',
                        //     {
                        //       $replaceOne: {
                        //         input: {
                        //           $arrayElemAt: ["$avatar.mediaUri", 0]
                        //         },
                        //         find: "_0001.jpeg",
                        //         replacement: ""
                        //       }
                        //     },

                        //   ]
                        // },
                        mediaEndpoint:
                        {
                            "$ifNull":
                                [
                                    {
                                        "$concat": ["/profilepict/", {
                                            $arrayElemAt: ['$avatar.mediaID', 0]
                                        },]
                                    },
                                    null
                                ]
                        }
                    },
                }
            },
        );

        var userchallengematch = [];

        if (setusername != null && setusername != undefined) {
            userchallengematch.push(
                {
                    username:
                    {
                        "$regex": setusername,
                        "$option": "i"
                    }
                }
            );
        }

        if (setjenisakun != null && setjenisakun != undefined) {
            userchallengematch.push(
                {
                    "$expr":
                    {
                        "$in":
                            [
                                "$statusKyc", setjenisakun
                            ]
                    }
                },
            );
        }

        if (setjeniskelamin != null && setjeniskelamin != undefined) {
            userchallengematch.push(
                {
                    "$expr":
                    {
                        "$in":
                            [
                                "$gender", setjeniskelamin
                            ]
                    }
                },
            );
        }

        if (setstartage != null && setendage != null) {
            userchallengematch.push(
                {
                    "$expr":
                    {
                        "$gte":
                            [
                                "$dob", setstartage
                            ]
                    }
                },
                {
                    "$expr":
                    {
                        "$lte":
                            [
                                "$dob", setendage
                            ]
                    }
                },
            );
        }

        if (userchallengematch.length != 0) {
            userchallengepipeline.push(
                {
                    "$match":
                    {
                        "$and": userchallengematch
                    }
                }
            );
        }

        var setsorting = null;
        if (sortingranking == true) {
            setsorting = 1;
        }
        else {
            setsorting = -1;
        }

        userchallengepipeline.push(
            {
                "$sort":
                {
                    ranking: setsorting
                }
            }
        );

        if (page > 0) {
            userchallengepipeline.push({
                "$skip": limit * page
            });
        }

        if (limit > 0) {
            userchallengepipeline.push({
                "$limit": limit
            });
        }

        pipeline.push(
            {
                "$lookup":
                {
                    from: "userChallenge",
                    as: "userChallenge_data",
                    let:
                    {
                        userChallenge_fk: "$_id"
                    },
                    pipeline: userchallengepipeline
                }
            },
        );

        // console.log(JSON.stringify(pipeline));

        var query = await this.subChallengeModel.aggregate(pipeline);
        return query;
    }

    async getListUserChallenge(idchallenge: string, iduser: string, status: string, session: number) {
        var pipeline = [];

        pipeline.push({
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
                                challengeId: new Types.ObjectId(idchallenge)
                            },
                            // {
                            //     $expr:
                            //     {
                            //         $lte:
                            //             [
                            //                 "$timenow",
                            //                 "$endDatetime",

                            //             ]
                            //     },

                            // },
                            // {
                            //     $expr:
                            //     {
                            //         $gte:
                            //             [
                            //                 "$timenow",
                            //                 "$startDatetime",

                            //             ]
                            //     },

                            // }
                        ]
                }
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
                                                            idUser: new Types.ObjectId(iduser),

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
                                $set: {
                                    lastRank:
                                    {
                                        $ifNull:
                                            [
                                                {
                                                    $arrayElemAt: ["$history.ranking", 0]
                                                },
                                                0
                                            ]
                                    }
                                }
                            },
                            {
                                $set: {
                                    userID: new Types.ObjectId(iduser),

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
                                                        idChallenge: new Types.ObjectId(idchallenge)
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
                                        idChallenge: new Types.ObjectId(idchallenge)
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

                                                    ]
                                                },

                                            },
                                            {
                                                $limit: 1
                                            },
                                            {
                                                $sort: {
                                                    score: - 1,
                                                    updatedAt: 1,

                                                }
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
                                                    postID: "$posted.postID",
                                                    postType: "$posted.postType",
                                                    apsaraId: "$posted.apsaraId",
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
                                    postChallengess: "$postChallenges",
                                    objectChallenge: "$challenges.objectChallenge",
                                    idUser: 1,
                                    score: 1,
                                    ranking: 1,
                                    lastRank: 1,
                                    idSubChallenge: 1,
                                    history: 1,
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
                                                        then: "UP"
                                                    },
                                                    {
                                                        case:
                                                        {
                                                            "$gt": ["$lastRank", "$ranking"]
                                                        },
                                                        then: "DOWN"
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
                        localID: new Types.ObjectId(iduser),

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
                        localID: new Types.ObjectId(idchallenge),

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
                $set:
                {
                    co: ["MALE", " MALE", "Laki-laki", "Pria"]
                },

            },
            {
                $set:
                {
                    ce:
                        ["FEMALE", " FEMALE", "Perempuan", "Wanita"]
                }
            },
            {
                $set:
                {
                    all: ["FEMALE", " FEMALE", "Perempuan", "Wanita", "MALE", " MALE", "Laki-laki", "Pria", "Other"]
                }
            },
            {
                $set:
                {
                    ceOther: ["FEMALE", " FEMALE", "Perempuan", "Wanita", "Other"]
                }
            },
            {
                $set:
                {
                    coOther: ["MALE", " MALE", "Laki-laki", "Pria", "Other"]
                }
            },
            {
                $set:
                {
                    ceCo: ["FEMALE", " FEMALE", "Perempuan", "Wanita", "MALE", " MALE", "Laki-laki", "Pria"]
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
                            else: "BERAKHIR"
                        }
                    },
                    "joined":
                    {
                        $cond: {
                            if: {
                                $eq: [{
                                    $arrayElemAt: ["$getlastrank.isUserLogin", 10]
                                }, true]
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
                                            then: {
                                                $cond: {
                                                    if: {
                                                        $eq: ["$ads.kelamin", "$joinUser.gender"]
                                                    },
                                                    else: "NOT ALLOWED",
                                                    then: {
                                                        $cond: {
                                                            if: {
                                                                $eq: ["$ageChallenge", true]
                                                            },
                                                            else: "NOT ALLOWED",
                                                            then: {
                                                                $cond: {
                                                                    if: {
                                                                        $eq: [{
                                                                            $arrayElemAt: ["$peserta.peserta.lokasiPengguna", 0]
                                                                        }, "$joinUser.states.$id"]
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
                $lookup: {
                    from: 'challenge',
                    localField: 'challengeId',
                    foreignField: '_id',
                    as: 'challenge_data',

                },

            },
            {
                "$lookup": {
                    from: "subChallenge",
                    as: "subChallenges",
                    let: {
                        localID: '$challengeId',

                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ["$challengeId", "$$localID"]
                                        },

                                    ]
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
                                _id: "$bulan",
                                "subChalange": {
                                    $push: "$$ROOT"
                                },

                            }
                        },
                        {
                            $sort: {
                                _id: 1
                            }
                        },

                    ],

                }
            },
            {
                $project:
                {
                    "_id": 1,
                    "challengeId": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "isActive": 1,
                    "session": 1,
                    "timenow": 1,
                    "getlastrank": 1,
                    "status": 1,
                    "joined": 1,
                    "challenge_data": 1,
                    "subChallenges": 1,

                }
            },
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

        var query = await this.subChallengeModel.aggregate(pipeline);
        return query;
    }

    async getjuara() {
        var pipeline = []
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
                    "$and":
                        [

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
                }
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
                                $set: {
                                    lastRank:
                                    {
                                        $ifNull:
                                            [
                                                {
                                                    $arrayElemAt: ["$history.ranking", 0]
                                                },
                                                0
                                            ]
                                    }
                                }
                            },

                            {
                                "$sort":
                                {
                                    ranking: 1
                                }
                            },
                            {
                                $limit: 3
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
                                        idChallenge: '$idChallenge',
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

                                        ],

                                }
                            },

                            {
                                "$project":
                                {
                                    idUser: 1,
                                    score: 1,
                                    ranking: 1,
                                    lastRank: 1,
                                    idSubChallenge: 1,
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
                                    idBadge:
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
                                                                $arrayElemAt: ["$challenges.winner1._id", 0]
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
                                                                $arrayElemAt: ["$challenges.winner2._id", 0]
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
                                                                $arrayElemAt: ["$challenges.winner3._id", 0]
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
                $project:
                {
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
                            else: "BERAKHIR"
                        }
                    },

                }
            },

        );
        var query = await this.subChallengeModel.aggregate(pipeline);
        return query;
    }

    async getcount(challengeId: string) {
        var query = await this.subChallengeModel.aggregate([
            {
                $match: {
                    "challengeId": new Types.ObjectId(challengeId),
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
}
