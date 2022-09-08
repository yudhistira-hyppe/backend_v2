import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateAdsDto } from './dto/create-ads.dto';
import { Ads, AdsDocument } from './schemas/ads.schema';
import { UtilsService } from '../../utils/utils.service';
@Injectable()
export class AdsService {
    private readonly logger = new Logger(AdsService.name);
    constructor(
        @InjectModel(Ads.name, 'SERVER_TRANS')
        private readonly adsModel: Model<AdsDocument>, private utilService: UtilsService,
    ) { }

    async create(CreateAdsDto: CreateAdsDto): Promise<Ads> {
        let data = await this.adsModel.create(CreateAdsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async findAll(): Promise<Ads[]> {
        return this.adsModel.find().exec();
    }

    async findAllActive(): Promise<Ads[]> {
        return this.adsModel.find({ isActive: true }).exec();
    }

    async findOneActive(id: string): Promise<Ads> {
        return this.adsModel.findOne({ _id: id, isActive: true }).exec();
    }

    async findOne(id: string): Promise<Ads> {
        return this.adsModel.findOne({ _id: id }).exec();
    }

    async delete(id: string) {
        const deletedCat = await this.adsModel
            .findByIdAndRemove({ _id: id })
            .exec();
        return deletedCat;
    }

    async update(
        id: string,
        createAdsDto: CreateAdsDto,
    ): Promise<Ads> {
        let data = await this.adsModel.findByIdAndUpdate(
            id,
            createAdsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async updateStatusView(id: Types.ObjectId, totalView: number): Promise<Object> {
        let data = await this.adsModel.updateOne({ "_id": id },
            { $set: { "totalView": totalView } });
        return data;
    }

    async updateStatusClick(id: Types.ObjectId, totalClick: number): Promise<Object> {
        let data = await this.adsModel.updateOne({ "_id": id },
            { $set: { "totalClick": totalClick } });
        return data;
    }

    async adsdata(userid: Types.ObjectId, startdate: string, enddate: string, skip: number, limit: number) {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }

        if (startdate !== undefined && enddate !== undefined) {
            const query = await this.adsModel.aggregate([


                {
                    $match: {
                        userID: userid,
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                }, {
                    $lookup: {
                        from: "userbasics",
                        localField: "userID",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $lookup: {
                        from: 'mediavideosads',
                        localField: 'mediaAds',
                        foreignField: '_id',
                        as: 'mediavideos_data',

                    },

                }, {
                    $lookup: {
                        from: 'mediaimageads',
                        localField: 'mediaAds',
                        foreignField: '_id',
                        as: 'mediaimages_data',

                    },

                }, {
                    $project: {
                        mediavideos: {
                            $arrayElemAt: ['$mediavideos_data', 0]
                        },
                        mediaimages: {
                            $arrayElemAt: ['$mediaimages_data', 0]
                        },
                        user: {
                            $arrayElemAt: ['$userbasics_data', 0]
                        },
                        timestamp: '$timestamp',
                        expiredAt: '$expiredAt',
                        gender: '$gender',
                        liveAt: '$liveAt',
                        name: '$name',
                        objectifitas: '$objectifitas',
                        status: '$status',
                        totalClick: '$totalClick',
                        totalUsedCredit: '$totalUsedCredit',
                        totalView: '$totalView',
                        urlLink: '$urlLink',
                        isActive: '$isActive',
                        type: "$type",

                    }
                }, {
                    $addFields: {


                        concatmediapict: '/mediaadsfile',
                        media_pict: {
                            $replaceOne: {
                                input: "$mediaimages.mediaUri",
                                find: "_0001.jpeg",
                                replacement: ""
                            }
                        },

                        concatmediavideo: '/mediaadsfile/vid/',
                        concatthumbvideo: '/mediaadsfile/thumb',
                        media_video: '$mediavideos.mediaUri'
                    },

                }, {
                    $project: {

                        mediaBasePath: {
                            $switch: {
                                branches: [
                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': '$mediaimages.mediaBasePath'
                                    },
                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': '$mediavideos.mediaBasePath'
                                    },

                                ],
                                default: ''
                            }
                        },
                        mediaUri: {
                            $switch: {
                                branches: [
                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': '$mediaimages.mediaUri'
                                    },
                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': '$mediavideos.mediaUri'
                                    },

                                ],
                                default: ''
                            }
                        },
                        mediaType: {
                            $switch: {
                                branches: [
                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': '$mediaimages.mediaType'
                                    },
                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': '$mediavideos.mediaType'
                                    },

                                ],
                                default: ''
                            }
                        },
                        mediaThumbUri: {
                            $switch: {
                                branches: [

                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': '$mediaimages.mediaThumb'
                                    },
                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': '$mediavideos.mediaThumb'
                                    },
                                ],
                                default: ''
                            }
                        },
                        mediaThumbEndpoint: {
                            $switch: {
                                branches: [
                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': '$mediaimages.mediaThumb'
                                    },

                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': {
                                            $concat: ["$concatthumbvideo", "/", "$media_video"]
                                        },

                                    }
                                ],
                                default: ''
                            }
                        },
                        mediaEndpoint: {
                            $switch: {
                                branches: [
                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': {
                                            $concat: ["$concatmediapict", "/", "$media_pict"]
                                        },

                                    },

                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': {
                                            $concat: ["$concatmediavideo", "/", "$media_video"]
                                        },

                                    }
                                ],
                                default: ''
                            }
                        },
                        fullName: '$user.fullName',
                        email: '$user.email',
                        timestamp: '$timestamp',
                        expiredAt: '$expiredAt',
                        gender: '$gender',
                        liveAt: '$liveAt',
                        name: '$name',
                        objectifitas: '$objectifitas',
                        status: '$status',
                        totalClick: '$totalClick',
                        totalUsedCredit: '$totalUsedCredit',
                        totalView: '$totalView',
                        urlLink: '$urlLink',
                        isActive: '$isActive',

                    }
                },
                { $sort: { timestamp: -1 }, },
                { $skip: skip },
                { $limit: limit }
            ]);
            return query;
        }

        else if (startdate === undefined && enddate === undefined) {
            const query = await this.adsModel.aggregate([


                {
                    $match: {
                        userID: userid
                    }
                }, {
                    $lookup: {
                        from: "userbasics",
                        localField: "userID",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $lookup: {
                        from: 'mediavideosads',
                        localField: 'mediaAds',
                        foreignField: '_id',
                        as: 'mediavideos_data',

                    },

                }, {
                    $lookup: {
                        from: 'mediaimageads',
                        localField: 'mediaAds',
                        foreignField: '_id',
                        as: 'mediaimages_data',

                    },

                }, {
                    $project: {
                        mediavideos: {
                            $arrayElemAt: ['$mediavideos_data', 0]
                        },
                        mediaimages: {
                            $arrayElemAt: ['$mediaimages_data', 0]
                        },
                        user: {
                            $arrayElemAt: ['$userbasics_data', 0]
                        },
                        timestamp: '$timestamp',
                        expiredAt: '$expiredAt',
                        gender: '$gender',
                        liveAt: '$liveAt',
                        name: '$name',
                        objectifitas: '$objectifitas',
                        status: '$status',
                        totalClick: '$totalClick',
                        totalUsedCredit: '$totalUsedCredit',
                        totalView: '$totalView',
                        urlLink: '$urlLink',
                        isActive: '$isActive',
                        type: "$type",

                    }
                }, {
                    $addFields: {


                        concatmediapict: '/mediaadsfile',
                        media_pict: {
                            $replaceOne: {
                                input: "$mediaimages.mediaUri",
                                find: "_0001.jpeg",
                                replacement: ""
                            }
                        },

                        concatmediavideo: '/mediaadsfile/vid/',
                        concatthumbvideo: '/mediaadsfile/thumb',
                        media_video: '$mediavideos.mediaUri'
                    },

                }, {
                    $project: {

                        mediaBasePath: {
                            $switch: {
                                branches: [
                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': '$mediaimages.mediaBasePath'
                                    },
                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': '$mediavideos.mediaBasePath'
                                    },

                                ],
                                default: ''
                            }
                        },
                        mediaUri: {
                            $switch: {
                                branches: [
                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': '$mediaimages.mediaUri'
                                    },
                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': '$mediavideos.mediaUri'
                                    },

                                ],
                                default: ''
                            }
                        },
                        mediaType: {
                            $switch: {
                                branches: [
                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': '$mediaimages.mediaType'
                                    },
                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': '$mediavideos.mediaType'
                                    },

                                ],
                                default: ''
                            }
                        },
                        mediaThumbUri: {
                            $switch: {
                                branches: [

                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': '$mediaimages.mediaThumb'
                                    },
                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': '$mediavideos.mediaThumb'
                                    },
                                ],
                                default: ''
                            }
                        },
                        mediaThumbEndpoint: {
                            $switch: {
                                branches: [
                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': '$mediaimages.mediaThumb'
                                    },

                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': {
                                            $concat: ["$concatthumbvideo", "/", "$media_video"]
                                        },

                                    }
                                ],
                                default: ''
                            }
                        },
                        mediaEndpoint: {
                            $switch: {
                                branches: [
                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': {
                                            $concat: ["$concatmediapict", "/", "$media_pict"]
                                        },

                                    },

                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': {
                                            $concat: ["$concatmediavideo", "/", "$media_video"]
                                        },

                                    }
                                ],
                                default: ''
                            }
                        },
                        fullName: '$user.fullName',
                        email: '$user.email',
                        timestamp: '$timestamp',
                        expiredAt: '$expiredAt',
                        gender: '$gender',
                        liveAt: '$liveAt',
                        name: '$name',
                        objectifitas: '$objectifitas',
                        status: '$status',
                        totalClick: '$totalClick',
                        totalUsedCredit: '$totalUsedCredit',
                        totalView: '$totalView',
                        urlLink: '$urlLink',
                        isActive: '$isActive',

                    }
                },
                { $sort: { timestamp: -1 }, },
                { $skip: skip },
                { $limit: limit }
            ]);
            return query;
        }

    }

    async adsdatabyid(id: Types.ObjectId) {

        const query = await this.adsModel.aggregate([


            {
                $match: {
                    _id: id,

                }
            }, {
                $lookup: {
                    from: "userbasics",
                    localField: "userID",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            }, {
                $lookup: {
                    from: 'mediavideosads',
                    localField: 'mediaAds',
                    foreignField: '_id',
                    as: 'mediavideos_data',

                },

            }, {
                $lookup: {
                    from: 'mediaimageads',
                    localField: 'mediaAds',
                    foreignField: '_id',
                    as: 'mediaimages_data',

                },

            }, {
                $project: {
                    mediavideos: {
                        $arrayElemAt: ['$mediavideos_data', 0]
                    },
                    mediaimages: {
                        $arrayElemAt: ['$mediaimages_data', 0]
                    },
                    user: {
                        $arrayElemAt: ['$userbasics_data', 0]
                    },
                    timestamp: '$timestamp',
                    expiredAt: '$expiredAt',
                    gender: '$gender',
                    liveAt: '$liveAt',
                    name: '$name',
                    objectifitas: '$objectifitas',
                    status: '$status',
                    totalClick: '$totalClick',
                    totalUsedCredit: '$totalUsedCredit',
                    totalView: '$totalView',
                    urlLink: '$urlLink',
                    isActive: '$isActive',
                    type: "$type",

                }
            }, {
                $addFields: {


                    concatmediapict: '/mediaadsfile',
                    media_pict: {
                        $replaceOne: {
                            input: "$mediaimages.mediaUri",
                            find: "_0001.jpeg",
                            replacement: ""
                        }
                    },

                    concatmediavideo: '/mediaadsfile/vid/',
                    concatthumbvideo: '/mediaadsfile/thumb',
                    media_video: '$mediavideos.mediaUri'
                },

            }, {
                $project: {

                    mediaBasePath: {
                        $switch: {
                            branches: [
                                {
                                    'case': {
                                        '$eq': ['$type', 'image']
                                    },
                                    'then': '$mediaimages.mediaBasePath'
                                },
                                {
                                    'case': {
                                        '$eq': ['$type', 'video']
                                    },
                                    'then': '$mediavideos.mediaBasePath'
                                },

                            ],
                            default: ''
                        }
                    },
                    mediaUri: {
                        $switch: {
                            branches: [
                                {
                                    'case': {
                                        '$eq': ['$type', 'image']
                                    },
                                    'then': '$mediaimages.mediaUri'
                                },
                                {
                                    'case': {
                                        '$eq': ['$type', 'video']
                                    },
                                    'then': '$mediavideos.mediaUri'
                                },

                            ],
                            default: ''
                        }
                    },
                    mediaType: {
                        $switch: {
                            branches: [
                                {
                                    'case': {
                                        '$eq': ['$type', 'image']
                                    },
                                    'then': '$mediaimages.mediaType'
                                },
                                {
                                    'case': {
                                        '$eq': ['$type', 'video']
                                    },
                                    'then': '$mediavideos.mediaType'
                                },

                            ],
                            default: ''
                        }
                    },
                    mediaThumbUri: {
                        $switch: {
                            branches: [

                                {
                                    'case': {
                                        '$eq': ['$type', 'image']
                                    },
                                    'then': '$mediaimages.mediaThumb'
                                },
                                {
                                    'case': {
                                        '$eq': ['$type', 'video']
                                    },
                                    'then': '$mediavideos.mediaThumb'
                                },
                            ],
                            default: ''
                        }
                    },
                    mediaThumbEndpoint: {
                        $switch: {
                            branches: [
                                {
                                    'case': {
                                        '$eq': ['$type', 'image']
                                    },
                                    'then': '$mediaimages.mediaThumb'
                                },

                                {
                                    'case': {
                                        '$eq': ['$type', 'video']
                                    },
                                    'then': {
                                        $concat: ["$concatthumbvideo", "/", "$media_video"]
                                    },

                                }
                            ],
                            default: ''
                        }
                    },
                    mediaEndpoint: {
                        $switch: {
                            branches: [
                                {
                                    'case': {
                                        '$eq': ['$type', 'image']
                                    },
                                    'then': {
                                        $concat: ["$concatmediapict", "/", "$media_pict"]
                                    },

                                },

                                {
                                    'case': {
                                        '$eq': ['$type', 'video']
                                    },
                                    'then': {
                                        $concat: ["$concatmediavideo", "/", "$media_video"]
                                    },

                                }
                            ],
                            default: ''
                        }
                    },
                    fullName: '$user.fullName',
                    email: '$user.email',
                    timestamp: '$timestamp',
                    expiredAt: '$expiredAt',
                    gender: '$gender',
                    liveAt: '$liveAt',
                    name: '$name',
                    objectifitas: '$objectifitas',
                    status: '$status',
                    totalClick: '$totalClick',
                    totalUsedCredit: '$totalUsedCredit',
                    totalView: '$totalView',
                    urlLink: '$urlLink',
                    isActive: '$isActive',

                }
            },
        ]);
        return query;
    }




}
