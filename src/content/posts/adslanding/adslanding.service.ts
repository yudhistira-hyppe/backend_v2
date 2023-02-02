import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ads, AdsDocument } from 'src/trans/ads/schemas/ads.schema';

@Injectable()
export class AdsLandingService {
    constructor(
        @InjectModel(Ads.name, 'SERVER_FULL')
        private readonly adsModel: Model<AdsDocument>,
    ) { } 

    async getAdsLanding(email: string) {
        var query = await this.adsModel.aggregate([
            {
                $set:
                {
                    email: email
                }
            },
            {
                $set:
                {
                    tay:
                    {
                        $ifNull: ['$tayang', 0]
                    }
                }
            },
            {
                $set:
                {
                    co: ["MALE", " MALE", "Laki-laki", "Pria"]
                }
            },
            {
                $set:
                {
                    ce: ["FEMALE", " FEMALE", "Perempuan", "Wanita"]
                }
            },
            {
                $set: {
                    "testDate":
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                                $add: [new Date(), 25200000]
                            }
                        }
                    }
                }
            },
            {
                $set: {
                    "tayang": {
                        $concat: [
                            "$liveAt",
                            " 00:00:00"
                        ]
                    }
                }
            },
            {
                "$lookup": {
                    from: "userbasics",
                    as: "userBasic",
                    let: {
                        localID: '$email'
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr: {
                                    $eq: ['$email', '$$localID']
                                }
                            }
                        },
                        {
                            $project: {
                                "email": 1,
                                "userInterests": 1,
                                "states": ["$states"],
                                "gender": ["$gender"],
                                "age":
                                {
                                    $cond: {
                                        if: {
                                            $and: ['$dob', {
                                                $ne: ["$dob", ""]
                                            }]
                                        },
                                        then: {
                                            $toInt: {
                                                $divide: [{
                                                    $subtract: [new Date(), {
                                                        $toDate: "$dob"
                                                    }]
                                                }, (365 * 24 * 60 * 60 * 1000)]
                                            }
                                        },
                                        else: 0
                                    }
                                },

                            }
                        }
                    ],

                }
            },
            {
                "$lookup": {
                    from: "adsplaces",
                    as: "places",
                    let: {
                        localID: '$placingID'
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr: {
                                    $eq: ['$_id', '$$localID']
                                }
                            }
                        },
                        {
                            $project: {
                                namePlace: 1,

                            }
                        }
                    ],

                }
            },
            {
                "$lookup": {
                    from: "userads",
                    as: "adsUser",
                    let: {
                        localID: '$userBasic._id'
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $in: ['$userID', '$$localID']
                                        }
                                    },
                                    {
                                        "statusView": true
                                    },
                                    // {
                                    //     "isActive": false
                                    // },
                                ]
                            },

                        },
                        {
                            $project: {
                                adsID: "$adsID",
                                dodol: {
                                    $toString: "$adsID"
                                },
                                userID: 1,
                            }
                        },

                    ],

                }
            },
            {
                $addFields: {
                    "isValid": {
                        "$in": [
                            "$_id",
                            "$adsUser.adsID"
                        ]
                    }
                }
            },
            {
                $match:
                {
                    $and: [
                        {
                            "status": "APPROVE"
                        },
                        {
                            $expr: {
                                $lt: ["$totalView", "$tay"]
                            }
                        },
                        {
                            "_id": {
                                $not: {
                                    $in: ["$adsUser.adsID"]
                                }
                            }
                        },
                        {
                            isValid: false
                        },

                    ]
                }
            },
            {
                $project: {
                    isValid: 1,
                    userBasic: 1,
                    email: "$_id",
                    userAds: "$adsUser.adsID",
                    ads: [{
                        _id: "$_id",
                        ageStart: "$startAge",
                        ageEnd: "$endAge",
                        liveTypeAds: "$liveTypeAds",
                        timestamps: "$timestamp",
                        placingID: "$placingID",
                        placingName:
                        {
                            //$arrayElemAt [ "$places.namePlace",0]
                            $arrayElemAt: ['$places.namePlace', 0]
                        },
                        demografisID:
                        {
                            $cond: {
                                if: {
                                    $isArray: "$view"
                                },
                                then: "$demografisID",
                                else: ["$demografisID"],

                            }
                        },
                        interestID: "$interestID",
                        gender: "$gender",
                        liveAt: "$liveTypeAds",
                        liveTypeuserads: "$liveTypeAds",
                        typeAdsID: "$typeAdsID",
                        kelamin:
                        {
                            $cond: {
                                if: {
                                    $eq: ['$gender', "L"]
                                },
                                then: "$co",
                                else: "$ce"
                            }
                        },

                    }]
                }
            },
            {
                "$lookup": {
                    from: "adstypes",
                    as: "types",
                    let: {
                        localID: '$ads.typeAdsID'
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr: {
                                    $in: ['$_id', '$$localID']
                                }
                            }
                        },
                        {
                            $project: {
                                "nameType": 1,

                            }
                        }
                    ],

                }
            },
            {
                $unwind: {
                    path: "$ads",

                }
            },
            {
                $unwind: {
                    path: "$userBasic",

                }
            },
            {
                $unwind: {
                    path: "$types",

                }
            },
            {
                $project: {
                    adsId: "$ads._id",
                    userID: "$userBasic._id",
                    liveAt: "$ads.liveAt",
                    liveTypeuserads: "$ads.liveTypeAds",
                    nameType: "$types.nameType",
                    timestamps: "$ads.timestamps",
                    placingID: "$ads.placingID",
                    placingName: "$ads.placingName",
                    createdAt:
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                                $add: [new Date(), 25200000]
                            }
                        }
                    },
                    kelaminku:
                    {
                        $cond: {
                            if: {
                                $gt: [{
                                    $size: {
                                        $setIntersection: ["$ads.kelamin", "$userBasic.gender"]
                                    }
                                }, 0]
                            },
                            then: 1,
                            else: 0
                        }
                    },
                    minat:
                    {
                        $cond: {
                            if: {
                                $gt: [{
                                    $size: {
                                        $setIntersection: ["$ads.interestID.$id", "$userBasic.userInterests.$id"]
                                    }
                                }, 0]
                            },
                            then: 1,
                            else: 0
                        }
                    },
                    lapak:
                    {
                        $cond: {
                            if: {
                                $gt: [{
                                    $size: {
                                        $setIntersection: ["$ads.demografisID.$id", "$userBasic.states.$id"]
                                    }
                                }, 0]
                            },
                            then: 1,
                            else: 0
                        }
                    },
                    umur:
                    {
                        $cond: {
                            if: {
                                $and: [
                                    {
                                        $gte: ["$userBasic.age", "$ads.ageStart"]
                                    },
                                    {
                                        $lte: ["$userBasic.age", "$ads.ageEnd"]
                                    }
                                ]
                            },
                            then: 1,
                            else: 0,

                        }
                    },

                }
            },
            {
                $project: {

                    placingID: 1,
                    placingName: 1,
                    timestamps: 1,
                    adsId: 1,
                    userID: 1,
                    liveAt: 1,
                    liveTypeuserads: 1,
                    nameType: 1,
                    createdAt: 1,
                    kelaminku: 1,
                    minat: 1,
                    lapak: 1,
                    umur: 1,
                    priority:
                    {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: "HIGHEST"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: "HIGHT"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: "HIGHT"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: "HIGHT"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: "HIGHT"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: "MEDIUM"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: "MEDIUM"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: "MEDIUM"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: "MEDIUM"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: "LOW"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: "LOW"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: "LOW"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: "LOW"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: "LOWEST"
                                },

                            ],
                            "default": "LOWEST"
                        }
                    },
                    priorityNumber:
                    {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: 6
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: 5
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: 5
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: 5
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: 5
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: 4
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: 4
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: 4
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: 4
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: 3
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: 3
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: 3
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: 3
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: 2
                                },

                            ],
                            "default": 2
                        }
                    },

                }
            },
            {
                $sort: {
                    priorityNumber: - 1,
                    timestamps: 1,

                }
            },
            {
                $facet: {
                    "Content Ads": [
                        {
                            $match:
                            {
                                "nameType": "Content Ads",

                            }
                        },
                        {
                            $skip: 0
                        },
                        {
                            $limit: 1
                        },

                    ],
                    "Sponsor Ads": [
                        {
                            $match:
                            {
                                "nameType": "Sponsor Ads",

                            }
                        },
                        {
                            $skip: 0
                        },
                        {
                            $limit: 1
                        },

                    ],
                    "In App Ads": [
                        {
                            $match:
                            {
                                "nameType": "In App Ads",

                            }
                        },
                        {
                            $skip: 0
                        },
                        {
                            $limit: 1
                        },

                    ],

                }
            }
        ]);
        return query;
    }
}
