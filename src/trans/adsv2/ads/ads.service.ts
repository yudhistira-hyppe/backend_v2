import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Ads, AdsDocument } from './schema/ads.schema';
import mongoose, { Model } from 'mongoose';
import { AdsDto } from './dto/ads.dto';
import { AdsBalaceCreditDto } from '../adsbalacecredit/dto/adsbalacecredit.dto';
import { AdsBalaceCreditService } from '../adsbalacecredit/adsbalacecredit.service';
import { AdsBalaceCredit } from '../adsbalacecredit/schema/adsbalacecredit.schema';
import { ConfigService } from '@nestjs/config';
import { PostContentService } from '../../../content/posts/postcontent.service';
import { AccountbalancesService } from '../../../trans/accountbalances/accountbalances.service';
import { UserAdsService } from '../../../trans/userads/userads.service';

@Injectable()
export class AdsService { 
    private readonly logger = new Logger(AdsService.name);
    constructor(
        @InjectModel(Ads.name, 'SERVER_FULL')
        private readonly adsModel: Model<AdsDocument>,
        private readonly configService: ConfigService,
        private readonly postContentService: PostContentService,
        private readonly adsBalaceCreditService: AdsBalaceCreditService, 
        private readonly AccountbalancesService: AccountbalancesService,
        private readonly userAdsService: UserAdsService, 
    ) { }

    async create(AdsDto_: AdsDto): Promise<Ads> {
        const _AdsDto_ = await this.adsModel.create(AdsDto_);
        return _AdsDto_;
    }

    async update(_id: string, AdsDto_: AdsDto) {
        let data = await this.adsModel.findByIdAndUpdate(
            _id,
            AdsDto_,
            { new: true });
        return data;
    }

    async findOne(id: string): Promise<Ads> {
        return await this.adsModel.findOne({ _id: Object(id) }).exec();
    }

    async findOneActive(id: string): Promise<Ads> {
        return this.adsModel.findOne({ _id: id, isActive: true }).exec();
    }

    async count(): Promise<number> {
        const _AdsDto_ = await this.adsModel.countDocuments();
        return _AdsDto_;
    }

    async insertBalaceDebit(adsBalaceCreditDto: AdsBalaceCreditDto): Promise<AdsBalaceCredit> {
        const _AdsDto_ = await this.adsBalaceCreditService.create(adsBalaceCreditDto);
        return _AdsDto_;
    }

    async dashboard(start_date: any, end_date: any): Promise<any> {
        var paramaggregate = [];
        paramaggregate.push({
            $addFields: {
                settingId: new mongoose.Types.ObjectId(this.configService.get("ID_SETTING_ADS_CREDIT_PRICE"))
            }
        });
        if (start_date != null && end_date != null) {
            start_date = new Date(start_date);
            end_date = new Date(end_date);
            end_date.setDate(end_date.getDate() + 1);
            const ObjectMatch = {
                $match: {
                    adsObjectivitasId: { $ne: null },
                    timestamp: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    },
                }
            };
            paramaggregate.push(ObjectMatch)
        } else {
            const ObjectMatch = {
                $match: {
                    adsObjectivitasId: { $ne: null },
                }
            };
            paramaggregate.push(ObjectMatch)
        }
        paramaggregate.push({
            $lookup: {
                from: "userbasics",
                localField: "userID",
                foreignField: "_id",
                as: "userbasics_data"
            }
        },
            {
                $lookup: {
                    from: "adstypes",
                    localField: "typeAdsID",
                    foreignField: "_id",
                    as: "adstypes_data"
                }
            },
            {
                $lookup: {
                    from: "adsobjectivitas",
                    localField: "adsObjectivitasId",
                    foreignField: "_id",
                    as: "adsobjectivitas_data"
                }
            },
            {
                $lookup: {
                    from: "settings",
                    localField: "settingId",
                    foreignField: "_id",
                    as: "settings_data"
                }
            },
            {
                $project: {
                    _id: 1,
                    creditPrice: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$settings_data", 0] },
                            },
                            "in": "$$tmp.value"
                        }
                    },
                    name: 1,
                    userID: 1,
                    status: 1,
                    fullName: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                            },
                            "in": "$$tmp.fullName"
                        }
                    },
                    typeAdsID: 1,
                    nameType: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adstypes_data", 0] },
                            },
                            "in": "$$tmp.nameType"
                        }
                    },
                    adsObjectivitasId: 1,
                    name_id: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adsobjectivitas_data", 0] },
                            },
                            "in": "$$tmp.name_id"
                        }
                    },
                    name_en: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adsobjectivitas_data", 0] },
                            },
                            "in": "$$tmp.name_en"
                        }
                    },
                    tayangQualication: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $lt: ["$tayang", 50]
                                    },
                                    then: "<50"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$tayang", 50]
                                        }, {
                                            $lte: ["$tayang", 99]
                                        }]
                                    },
                                    then: "50 - 99"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$tayang", 100]
                                        }, {
                                            $lte: ["$tayang", 500]
                                        }]
                                    },
                                    then: "100 - 500"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gt: ["$tayang", 500]
                                        }]
                                    },
                                    then: ">500"
                                },
                            ],
                            "default": "Other"
                        }
                    },
                    credit: 1
                }
            },
            {
                $facet:
                {
                    user: [
                        {
                            $group: {
                                _id: "$userID",
                                email: { $first: '$email' },
                                fullName: { $first: '$fullName' },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    iklan: [
                        {
                            $group: {
                                _id: "$_id",
                                name: { $first: '$name' },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    typeAdsID: [
                        {
                            $group: {
                                _id: "$typeAdsID",
                                nameType: { $first: '$nameType' },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    status: [
                        {
                            $group: {
                                _id: "$status",
                                status: { $first: '$status' },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    adsObjectivitasId: [
                        {
                            $group: {
                                _id: "$adsObjectivitasId",
                                name_id: { $first: '$name_id' },
                                name_en: { $first: '$name_en' },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    tayangQualication: [
                        {
                            $group: {
                                _id: "$tayangQualication",
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    totalCredit: [
                        {
                            $group: {
                                _id: null,
                                sum_val: { $sum: "$credit" },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    creditPrice: [
                        {
                            $group: {
                                _id: "$creditPrice",
                                count: { $sum: 1 }
                            }
                        }
                    ],
                }
            },
            {
                $project: {
                    totalAds: { $size: "$iklan" },
                    totalAdvertisers: { $size: "$user" },
                    statusAds: "$status",
                    totalIncome: {
                        $multiply: [{
                            "$let": {
                                "vars": {
                                    "tmp": { "$arrayElemAt": ["$totalCredit", 0] },
                                },
                                "in": "$$tmp.sum_val"
                            }
                        }, {
                            "$let": {
                                "vars": {
                                    "tmp": { "$arrayElemAt": ["$creditPrice", 0] },
                                },
                                "in": "$$tmp._id"
                            }
                        }]
                    },
                    adsType: "$typeAdsID",
                    totCredit: 1,
                    adsObjectivitas: "$adsObjectivitasId",
                    adsPlanShows: "$tayangQualication",
                    // totalCredit: {
                    //     "$let": {
                    //         "vars": {
                    //             "tmp": { "$arrayElemAt": ["$totalCredit", 0] },
                    //         },
                    //         "in": "$$tmp.sum_val"
                    //     }
                    // },
                    // creditPrice: {
                    //     "$let": {
                    //         "vars": {
                    //             "tmp": { "$arrayElemAt": ["$creditPrice", 0] },
                    //         },
                    //         "in": "$$tmp._id"
                    //     }
                    // },
                }
            },
            {
                "$addFields": {
                    "adsType": {
                        "$map": {
                            "input": { "$range": [0, { "$size": "$adsType" }] },
                            "in": {
                                "_id": {
                                    "$arrayElemAt": ["$adsType._id", "$$this"]
                                },
                                "count": {
                                    "$arrayElemAt": ["$adsType.count", "$$this"]
                                },
                                "nameType": {
                                    "$arrayElemAt": ["$adsType.nameType", "$$this"]
                                },
                                "persentase": {
                                    "$multiply": [{
                                        "$divide": [{
                                            "$arrayElemAt": ["$adsType.count", "$$this"]
                                        }, "$totalAds"]
                                    }, 100]
                                },
                                "persentaseText": {
                                    "$concat": [{
                                        "$toString": {
                                            "$multiply": [{
                                                "$divide": [{
                                                    "$arrayElemAt": ["$adsType.count", "$$this"]
                                                }, "$totalAds"]
                                            }, 100]
                                        }
                                    }, "", "%"]
                                }
                            }
                        }
                    },
                    "adsObjectivitas": {
                        "$map": {
                            "input": { "$range": [0, { "$size": "$adsObjectivitas" }] },
                            "in": {
                                "_id": {
                                    "$arrayElemAt": ["$adsObjectivitas._id", "$$this"]
                                },
                                "count": {
                                    "$arrayElemAt": ["$adsObjectivitas.count", "$$this"]
                                },
                                "name_id": {
                                    "$arrayElemAt": ["$adsObjectivitas.name_id", "$$this"]
                                },
                                "name_en": {
                                    "$arrayElemAt": ["$adsObjectivitas.name_en", "$$this"]
                                },
                                "persentase": {
                                    "$multiply": [{
                                        "$divide": [{
                                            "$arrayElemAt": ["$adsObjectivitas.count", "$$this"]
                                        }, "$totalAds"]
                                    }, 100]
                                },
                                "persentaseText": {
                                    "$concat": [{
                                        "$toString": {
                                            "$multiply": [{
                                                "$divide": [{
                                                    "$arrayElemAt": ["$adsObjectivitas.count", "$$this"]
                                                }, "$totalAds"]
                                            }, 100]
                                        }
                                    }, "", "%"]
                                }
                            }
                        }
                    },
                    "adsPlanShows": {
                        "$map": {
                            "input": { "$range": [0, { "$size": "$adsPlanShows" }] },
                            "in": {
                                "name": {
                                    "$arrayElemAt": ["$adsPlanShows._id", "$$this"]
                                },
                                "count": {
                                    "$arrayElemAt": ["$adsPlanShows.count", "$$this"]
                                },
                                "persentase": {
                                    "$multiply": [{
                                        "$divide": [{
                                            "$arrayElemAt": ["$adsPlanShows.count", "$$this"]
                                        }, "$totalAds"]
                                    }, 100]
                                },
                                "persentaseText": {
                                    "$concat": [{
                                        "$toString": {
                                            "$multiply": [{
                                                "$divide": [{
                                                    "$arrayElemAt": ["$adsPlanShows.count", "$$this"]
                                                }, "$totalAds"]
                                            }, 100]
                                        }
                                    }, "", "%"]
                                }
                            }
                        }
                    },
                    "statusAds": {
                        "$map": {
                            "input": { "$range": [0, { "$size": "$statusAds" }] },
                            "in": {
                                "name": {
                                    "$arrayElemAt": ["$statusAds._id", "$$this"]
                                },
                                "count": {
                                    "$arrayElemAt": ["$statusAds.count", "$$this"]
                                },
                                "persentase": {
                                    "$multiply": [{
                                        "$divide": [{
                                            "$arrayElemAt": ["$statusAds.count", "$$this"]
                                        }, "$totalAds"]
                                    }, 100]
                                },
                                "persentaseText": {
                                    "$concat": [{
                                        "$toString": {
                                            "$multiply": [{
                                                "$divide": [{
                                                    "$arrayElemAt": ["$statusAds.count", "$$this"]
                                                }, "$totalAds"]
                                            }, 100]
                                        }
                                    }, "", "%"]
                                }
                            }
                        }
                    }
                }
            },);
        let query = await this.adsModel.aggregate(paramaggregate);
        return query;

    }

    async campaignDashboard(start_date: any, end_date: any): Promise<any> {
        return await this.userAdsService.campaignDashboard(start_date, end_date);
    }

    async campaignDetail(adsId: string): Promise<any> {
        const query = await this.adsModel.aggregate([
            {
                $match:
                {
                    _id: new mongoose.Types.ObjectId(adsId)
                },
            },
            {
                $lookup: {
                    from: "adstypes",
                    localField: "typeAdsID",
                    foreignField: "_id",
                    as: "adstypes_data"
                }
            },
            {
                $lookup: {
                    from: "adsobjectivitas",
                    localField: "adsObjectivitasId",
                    foreignField: "_id",
                    as: "adsobjectivitas_data"
                }
            },
            {
                $project:{
                    _id: 1,
                    campaignId: 1,
                    name: 1,
                    description: 1,
                    typeAdsID: 1,
                    typeAdsIDName: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adstypes_data", 0] },
                            },
                            "in": "$$tmp.nameType"
                        }
                    },
                    liveAt: 1,
                    liveEnd: 1,
                    urlLink: 1,
                    tayang: 1, 
                    credit: 1,
                    objectivitasId: 1,
                    objectivitasIdNameId: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adsobjectivitas_data", 0] },
                            },
                            "in": "$$tmp.name_id"
                        }
                    },
                    objectivitasIdNameEn: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adsobjectivitas_data", 0] },
                            },
                            "in": "$$tmp.name_en"
                        }
                    },
                    audiensFrekuensi: 1,
                    status: 1,
                    dayAds: 1,
                }
            }
        ]);
        return query;
    }

    async campaignDetailSummary(adsId: string, start_date: any, end_date: any): Promise<any> {
        return await this.userAdsService.campaignDetailSummary(adsId, start_date, end_date);
    }

    async campaignDetailAll(adsId: string, start_date: any, end_date: any): Promise<any> {
        return await this.userAdsService.campaignDetail(adsId,start_date, end_date);
    }

    async list(name_ads: string, start_date: any, end_date: any, type_ads: any[], plan_ads: any[], status_list: any[], page: number, limit: number, sorting: boolean) {
        var paramaggregate = [];
        var $match = {};
        $match["adsObjectivitasId"] = { $ne: null };
        //------------FILTER DATE START END------------
        if (start_date != undefined && end_date != undefined) {
            start_date = new Date(start_date);
            end_date = new Date(end_date);
            end_date.setDate(end_date.getDate() + 1);
            $match["liveAt"] = {
                $gte: start_date.toISOString(),
                $lte: end_date.toISOString()
            };
        }
        //------------FILTER NAME------------
        if (name_ads != undefined) {
            $match["name"] = {
                $regex: name_ads,
                $options: "i"
            };
        }
        //------------FILTER TYPE ADS------------
        if (type_ads != undefined) {
            if (type_ads.length > 0) {
                $match["typeAdsID"] = { $in: type_ads };
            }
        }
        //------------FILTER TAYANG------------
        if (plan_ads != undefined){
            if (plan_ads.length>0){
                if (plan_ads.includes("show_smaller_than_50")) {
                    $match["tayang"] = {
                        $lt: 50
                    }
                }
                if (plan_ads.includes("show_50_smaller_than_90")) {
                    $match["tayang"] = {
                        $gte: 50, $lte: 99
                    }
                }
                if (plan_ads.includes("show_100_smaller_than_500")) {
                    $match["tayang"] = {
                        $gte: 100, $lte: 500
                    }
                }
                if (plan_ads.includes("show_greater_than_500")) {
                    $match["tayang"] = {
                        $gt: 50
                    }
                }
            }
        }
        //------------FILTER STATUS------------
        if (status_list != undefined) {
            if (status_list.length > 0) {
                $match["status"] = { $in: status_list };
            }
        }
        console.log($match);
        //------------PUSH MATCH------------
        paramaggregate.push({ $match });
        //------------FACET VIEWED------------
        var viewedFacet = [];
        if (start_date != undefined && end_date != undefined) {
            viewedFacet.push({
                $match: {
                    viewTime: {
                        $elemMatch: {
                            $gte: start_date.toISOString(),
                            $lte: end_date.toISOString()
                        }
                    }
                }
            });
        }
        viewedFacet.push({
            $unwind:
            {
                path: "$viewTime",
                includeArrayIndex: 'viewTime_index',
            }
        });
        if (start_date != undefined && end_date != undefined) {
            viewedFacet.push({
                $match: {
                    viewTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        viewedFacet.push({
            $group: {
                _id: "$userID",
                userIDCount: { "$sum": 1 }
            }
        },
        {
            $group: {
                _id: null,
                reach: { "$sum": 1 },
                impresi: { "$sum": "$userIDCount" }
            }
        },
        {
            $project: {
                _id: 0,
                reach: 1,
                impresi: 1
            }
        });
        //------------FACET CTA------------
        var CTACountFacet = [];
        if (start_date != undefined && end_date != undefined) {
            CTACountFacet.push({
                $match: {
                    clickTime: {
                        $elemMatch: {
                            $gte: start_date.toISOString(),
                            $lte: end_date.toISOString()
                        }
                    }
                }
            });
        }
        CTACountFacet.push({
            $unwind:
            {
                path: "$clickTime",
                includeArrayIndex: 'clickTime_index',
            }
        });
        if (start_date != undefined && end_date != undefined) {
            CTACountFacet.push({
                $match: {
                    clickTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        CTACountFacet.push({
            $project: {
                clickTime: {
                    $substr:
                        [
                            "$clickTime", 0, 10
                        ]
                }
            }
        },
        {
            $group:
            {
                _id: "$clickTime",
                CTACount:
                {
                    "$sum": 1
                }
            }
        },
        {
            $group:
            {
                _id: null,
                CTACount:
                {
                    "$sum": "$CTACount"
                }
            }
        });
        //------------PUSH QUERY------------
        paramaggregate.push(
            {
                $lookup:
                {
                    from: "adstypes",
                    as: "type_data",
                    let:
                    {
                        "type_fk": "$typeAdsID"
                    },
                    pipeline:
                    [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $eq:
                                        [
                                            "$_id",
                                            "$$type_fk"
                                        ]
                                }
                            },
                        },
                        {
                            $project:
                            {
                                nameType: 1,
                                creditValue: 1,
                            }
                        }
                    ]
                }
            },
            {
                $lookup:
                {
                    from: "userads",
                    as: "userads_data",
                    let:
                    {
                        "type_fk": "$_id"
                    },
                    pipeline:
                        [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr:
                                            {
                                                $eq:
                                                [
                                                    "$adsID",
                                                    "$$type_fk"
                                                ]
                                            }
                                        },
                                    ]
                                },
                            },
                            {
                                $facet:{
                                    viewed: viewedFacet,
                                    CTACount: CTACountFacet,
                                }
                            },
                        ]
                }
            },
            {
                $project:
                {
                    _id: 1,
                    campaignId: 1,
                    name: 1,
                    liveAt: 1, 
                    liveEnd: 1,
                    userID: 1,
                    typesID: 1,
                    adstypes:
                    {
                        "$arrayElemAt":
                        [
                            "$type_data.nameType", 0
                        ]
                    },
                    tayang: 1,
                    totalCredit: 1,
                    status: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ['$status', 'DRAFT'] },
                                    then: 'DRAFT',
                                },
                                {
                                    case: { $or: [{ $eq: ['$status', 'FINISH'] }, { $eq: ['$status', 'IN_ACTIVE'] }, { $eq: ['$status', 'REPORTED'] } ] },
                                    then: 'IN_ACTIVE',
                                }, 
                                {
                                    case: { $or: [{ $eq: ['$status', 'APPROVE'] }, { $eq: ['$status', 'ACTIVE'] }] },
                                    then: 'ACTIVE',
                                },
                                {
                                    case: { $eq: ['$status', 'UNDER_REVIEW'] },
                                    then: 'UNDER_REVIEW',
                                },

                            ],
                            default: "OTHER",

                        },

                    },
                    remark: 1,
                    CTA: {
                        $let: {
                            "vars": {
                                userads_data: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$userads_data", 0] },
                                            },
                                            "in": "$$tmp.CTACount"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$userads_data.CTACount"
                        }
                    },
                    impresi: {
                        $let: {
                            "vars": {
                                userads_data: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$userads_data", 0] },
                                            },
                                            "in": "$$tmp.viewed"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$userads_data.impresi"
                        }
                    },
                    reach: {
                        $let: {
                            "vars": {
                                userads_data: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$userads_data", 0] },
                                            },
                                            "in": "$$tmp.viewed"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$userads_data.reach"
                        }
                    },
                    // placingID: 1, 
                    // timestamp: 1,
                    // creditFree: 1,
                    // totalUsedCredit: 1,
                    // usedCreditFree: 1,
                    // usedCredit: 1,
                    idApsara: 1,
                    // totalView:
                    // {
                    //     "$ifNull":
                    //     [
                    //         "$totalView",
                    //         0
                    //     ]
                    // },
                    // isActive: 1,
                    apsara: {
                        "$cond":
                        {
                            if:
                            {
                                "$eq": ["$idApsara", null]
                            },
                            then: false,
                            else: true
                        }
                    },
                    // type: 1,
                    // tempreportedUserCount:
                    // {
                    //     "$ifNull":
                    //     [
                    //         "$reportedUserCount",
                    //         0
                    //     ]
                    // },
                    // sumtotalusedCredit:
                    // {
                    //     "$multiply":
                    //     [
                    //         {
                    //             "$ifNull":
                    //                 [
                    //                     "$totalView",
                    //                     0
                    //                 ]
                    //         },
                    //         {
                    //             "$arrayElemAt":
                    //                 [
                    //                     "$type_data.creditValue", 0
                    //                 ]
                    //         }
                    //     ]
                    // }
                }
            }
        );
        //------------SORTIR------------
        if (sorting) {
            paramaggregate.push({
                "$sort":{
                    timestamp: -1
                }
            });
        } else {
            paramaggregate.push({
                "$sort":{
                    timestamp: 1
                }
            })
        }
        //------------PAGE------------
        if (page > 0) {
            paramaggregate.push({
                "$skip": (limit * page)
            });
        }
        //------------LIMIT------------
        if (limit > 0) {
            paramaggregate.push({
                "$limit": limit
            });
        }
        console.log(paramaggregate);
        var query = await this.adsModel.aggregate(paramaggregate);

        var listdata = [];
        var tempresult = null;
        var tempdata = null;
        for (var i = 0; i < query.length; i++) {
            tempdata = query[i];
            if (tempdata.apsara == true) {
                listdata.push(tempdata.idApsara);
            }
            else {
                listdata.push(undefined);
            }
        }

        var apsaraimagedata = await this.postContentService.getImageApsara(listdata);
        // console.log(resultdata.ImageInfo[0]);
        tempresult = apsaraimagedata.ImageInfo;
        for (var i = 0; i < query.length; i++) {
            for (var j = 0; j < tempresult.length; j++) {
                if (tempresult[j].ImageId == query[i].idApsara) {
                    query[i].media =
                    {
                        "ImageInfo": [tempresult[j]]
                    }
                }
                else if (query[i].apsara == false && (query[i].type == "image" || query[i].type == "images")) {
                    query[i].media =
                    {
                        "ImageInfo": []
                    }
                }
            }
        }

        var apsaravideodata = await this.postContentService.getVideoApsara(listdata);
        // console.log(apsaravideodata);
        // console.log(resultdata.ImageInfo[0]);
        tempresult = apsaravideodata.VideoList;
        for (var i = 0; i < query.length; i++) {
            for (var j = 0; j < tempresult.length; j++) {
                if (tempresult[j].VideoId == query[i].idApsara) {
                    query[i].media =
                    {
                        "VideoList": [tempresult[j]]
                    }
                }
                else if (query[i].apsara == false && query[i].type == "video") {
                    query[i].media =
                    {
                        "VideoList": []
                    }
                }
            }
        }

        return query;
    }

    async list_reward(name: string, start_date: any, end_date: any, gender: any[], age: any[], areas: any[], page: number, limit: number, sorting: boolean) {
        const getReward = await this.AccountbalancesService.getReward(name, start_date, end_date, gender, age, areas, page, limit, sorting);
        return getReward;
    }

}
