import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateAdsDto } from './dto/create-ads.dto';
import { Ads, AdsDocument } from './schemas/ads.schema';
import { UtilsService } from '../../utils/utils.service';
import { PostsService } from '../../content/posts/posts.service';
import { PostContentService } from '../../content/posts/postcontent.service';
import { ObjectID } from 'bson';
@Injectable()
export class AdsService {
    private readonly logger = new Logger(AdsService.name);
    constructor(
        @InjectModel(Ads.name, 'SERVER_FULL')
        private readonly adsModel: Model<AdsDocument>,
        private utilService: UtilsService,
        private readonly postsService: PostsService,
        private readonly postContentService: PostContentService,
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
    async updatemediaAds(id: Types.ObjectId, mediaAds: Types.ObjectId): Promise<Object> {
        let data = await this.adsModel.updateOne({ "_id": id },
            { $set: { "mediaAds": mediaAds } });
        return data;
    }

    async updateReportuser(id: Types.ObjectId, reportedStatus: string, reportedUserCount: number, reportedUser: any[], contentModeration: boolean, contentModerationResponse: string, reportedUserHandle: any[]): Promise<Object> {
        let data = await this.adsModel.updateOne({ "_id": id },
            { $set: { "reportedStatus": reportedStatus, "reportedUserCount": reportedUserCount, "reportedUser": reportedUser, "contentModeration": contentModeration, "contentModerationResponse": contentModerationResponse, "reportedUserHandle": reportedUserHandle } });
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


    async list(userid: ObjectID, search: string, startdate: string, enddate: string, skip: number, limit: number) {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }

        if (search !== undefined && startdate === undefined && enddate === undefined) {
            let query = await this.adsModel.aggregate([
                {
                    $match: {
                        userID: userid,
                        $or: [{
                            name: {
                                $regex: search,
                                $options: 'i'
                            },

                        }, {
                            description: {
                                $regex: search,
                                $options: 'i'
                            },

                        }],
                    }
                },
                {
                    $lookup: {
                        from: "adsplaces",
                        localField: "placingID",
                        foreignField: "_id",
                        as: "placeData"
                    }
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "userID",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },

                {
                    $project: {

                        place: {
                            $arrayElemAt: ['$placeData', 0]
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
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang'
                    }
                },

                {
                    $project: {


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
                        namePlace: '$place.namePlace',
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang',
                        type: "$type",
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }

            ]).exec();
            var data = null;
            var arrdata = [];
            let pict: String[] = [];
            var objk = {};
            var type = null;
            var idapsara = null;
            for (var i = 0; i < query.length; i++) {
                try {
                    idapsara = query[i].idApsara;
                } catch (e) {
                    idapsara = "";
                }

                var type = query[i].type;
                pict = [idapsara];

                if (idapsara === "") {
                    data = [];
                } else {
                    if (type === "image" || type === "images") {

                        try {
                            data = await this.postContentService.getImageApsara(pict);
                        } catch (e) {
                            data = [];
                        }
                    }
                    else if (type === "video") {
                        try {
                            data = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            data = [];
                        }

                    }

                }
                objk = {
                    _id: query[i]._id,
                    fullName: query[i].fullName,
                    email: query[i].email,
                    timestamp: query[i].timestamp,
                    expiredAt: query[i].expiredAt,
                    gender: query[i].gender,
                    liveAt: query[i].liveAt,
                    name: query[i].name,
                    objectifitas: query[i].objectifitas,
                    status: query[i].status,
                    totalClick: query[i].totalClick,
                    totalUsedCredit: query[i].totalUsedCredit,
                    totalView: query[i].totalView,
                    urlLink: query[i].urlLink,
                    isActive: query[i].isActive,
                    namePlace: query[i].namePlace,
                    idApsara: query[i].idApsara,
                    duration: query[i].duration,
                    tayang: query[i].tayang,
                    media: data
                };

                arrdata.push(objk);
            }
            return arrdata;
        }
        else if (search === undefined && startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([
                {
                    $match: {
                        userID: userid,
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },
                {
                    $lookup: {
                        from: "adsplaces",
                        localField: "placingID",
                        foreignField: "_id",
                        as: "placeData"
                    }
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "userID",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },

                {
                    $project: {

                        place: {
                            $arrayElemAt: ['$placeData', 0]
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
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang'
                    }
                },

                {
                    $project: {


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
                        namePlace: '$place.namePlace',
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang',
                        type: "$type",
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }

            ]).exec();
            var data = null;
            var arrdata = [];
            let pict: String[] = [];
            var objk = {};
            var type = null;
            var idapsara = null;
            for (var i = 0; i < query.length; i++) {
                try {
                    idapsara = query[i].idApsara;
                } catch (e) {
                    idapsara = "";
                }

                var type = query[i].type;
                pict = [idapsara];

                if (idapsara === "") {
                    data = [];
                } else {
                    if (type === "image" || type === "images") {

                        try {
                            data = await this.postContentService.getImageApsara(pict);
                        } catch (e) {
                            data = [];
                        }
                    }
                    else if (type === "video") {
                        try {
                            data = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            data = [];
                        }

                    }

                }
                objk = {
                    _id: query[i]._id,
                    fullName: query[i].fullName,
                    email: query[i].email,
                    timestamp: query[i].timestamp,
                    expiredAt: query[i].expiredAt,
                    gender: query[i].gender,
                    liveAt: query[i].liveAt,
                    name: query[i].name,
                    objectifitas: query[i].objectifitas,
                    status: query[i].status,
                    totalClick: query[i].totalClick,
                    totalUsedCredit: query[i].totalUsedCredit,
                    totalView: query[i].totalView,
                    urlLink: query[i].urlLink,
                    isActive: query[i].isActive,
                    namePlace: query[i].namePlace,
                    idApsara: query[i].idApsara,
                    duration: query[i].duration,
                    tayang: query[i].tayang,
                    media: data
                };

                arrdata.push(objk);
            }
            return arrdata;
        }
        else if (search !== undefined && startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([
                {
                    $match: {
                        userID: userid,
                        $or: [{
                            name: {
                                $regex: search,
                                $options: 'i'
                            },

                        }, {
                            description: {
                                $regex: search,
                                $options: 'i'
                            },

                        }],
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },
                {
                    $lookup: {
                        from: "adsplaces",
                        localField: "placingID",
                        foreignField: "_id",
                        as: "placeData"
                    }
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "userID",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },

                {
                    $project: {

                        place: {
                            $arrayElemAt: ['$placeData', 0]
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
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang'
                    }
                },

                {
                    $project: {


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
                        namePlace: '$place.namePlace',
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang',
                        type: "$type",
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }

            ]).exec();
            var data = null;
            var arrdata = [];
            let pict: String[] = [];
            var objk = {};
            var type = null;
            var idapsara = null;
            for (var i = 0; i < query.length; i++) {
                try {
                    idapsara = query[i].idApsara;
                } catch (e) {
                    idapsara = "";
                }

                var type = query[i].type;
                pict = [idapsara];

                if (idapsara === "") {
                    data = [];
                } else {
                    if (type === "image" || type === "images") {

                        try {
                            data = await this.postContentService.getImageApsara(pict);
                        } catch (e) {
                            data = [];
                        }
                    }
                    else if (type === "video") {
                        try {
                            data = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            data = [];
                        }

                    }

                }
                objk = {
                    _id: query[i]._id,
                    fullName: query[i].fullName,
                    email: query[i].email,
                    timestamp: query[i].timestamp,
                    expiredAt: query[i].expiredAt,
                    gender: query[i].gender,
                    liveAt: query[i].liveAt,
                    name: query[i].name,
                    objectifitas: query[i].objectifitas,
                    status: query[i].status,
                    totalClick: query[i].totalClick,
                    totalUsedCredit: query[i].totalUsedCredit,
                    totalView: query[i].totalView,
                    urlLink: query[i].urlLink,
                    isActive: query[i].isActive,
                    namePlace: query[i].namePlace,
                    idApsara: query[i].idApsara,
                    duration: query[i].duration,
                    tayang: query[i].tayang,
                    media: data
                };

                arrdata.push(objk);
            }
            return arrdata;
        }
        else {
            let query = await this.adsModel.aggregate([
                {
                    $match: {
                        userID: userid,
                    }
                },
                {
                    $lookup: {
                        from: "adsplaces",
                        localField: "placingID",
                        foreignField: "_id",
                        as: "placeData"
                    }
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "userID",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },

                {
                    $project: {

                        place: {
                            $arrayElemAt: ['$placeData', 0]
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
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang'
                    }
                },

                {
                    $project: {


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
                        namePlace: '$place.namePlace',
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang',
                        type: "$type",
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }

            ]).exec();

            var data = null;
            var arrdata = [];
            let pict: String[] = [];
            var objk = {};
            var type = null;
            var idapsara = null;
            for (var i = 0; i < query.length; i++) {
                try {
                    idapsara = query[i].idApsara;
                } catch (e) {
                    idapsara = "";
                }

                var type = query[i].type;
                pict = [idapsara];

                if (idapsara === "") {
                    data = [];
                } else {
                    if (type === "image" || type === "images") {

                        try {
                            data = await this.postContentService.getImageApsara(pict);
                        } catch (e) {
                            data = [];
                        }
                    }
                    else if (type === "video") {
                        try {
                            data = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            data = [];
                        }

                    }

                }
                objk = {
                    _id: query[i]._id,
                    fullName: query[i].fullName,
                    email: query[i].email,
                    timestamp: query[i].timestamp,
                    expiredAt: query[i].expiredAt,
                    gender: query[i].gender,
                    liveAt: query[i].liveAt,
                    name: query[i].name,
                    objectifitas: query[i].objectifitas,
                    status: query[i].status,
                    totalClick: query[i].totalClick,
                    totalUsedCredit: query[i].totalUsedCredit,
                    totalView: query[i].totalView,
                    urlLink: query[i].urlLink,
                    isActive: query[i].isActive,
                    namePlace: query[i].namePlace,
                    idApsara: query[i].idApsara,
                    duration: query[i].duration,
                    tayang: query[i].tayang,
                    media: data
                };

                arrdata.push(objk);
            }
            return arrdata;

        }

    }

    async listcount(userid: ObjectID, search: string, startdate: string, enddate: string): Promise<Ads[]> {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }

        if (search !== undefined && startdate === undefined && enddate === undefined) {
            let query = await this.adsModel.aggregate([
                {
                    $match: {
                        userID: userid,
                        $or: [{
                            name: {
                                $regex: search,
                                $options: 'i'
                            },

                        }, {
                            description: {
                                $regex: search,
                                $options: 'i'
                            },

                        }],
                    }
                },
                {
                    $lookup: {
                        from: "adsplaces",
                        localField: "placingID",
                        foreignField: "_id",
                        as: "placeData"
                    }
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "userID",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },

                {
                    $project: {

                        place: {
                            $arrayElemAt: ['$placeData', 0]
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
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang'
                    }
                },

                {
                    $project: {


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
                        namePlace: '$place.namePlace',
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang'
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },


            ]).exec();
            return query;
        }
        else if (search === undefined && startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([
                {
                    $match: {
                        userID: userid,
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },
                {
                    $lookup: {
                        from: "adsplaces",
                        localField: "placingID",
                        foreignField: "_id",
                        as: "placeData"
                    }
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "userID",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },

                {
                    $project: {

                        place: {
                            $arrayElemAt: ['$placeData', 0]
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
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang'
                    }
                },

                {
                    $project: {


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
                        namePlace: '$place.namePlace',
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang'
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },


            ]).exec();
            return query;
        }
        else if (search !== undefined && startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([
                {
                    $match: {
                        userID: userid,
                        $or: [{
                            name: {
                                $regex: search,
                                $options: 'i'
                            },

                        }, {
                            description: {
                                $regex: search,
                                $options: 'i'
                            },

                        }],
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },
                {
                    $lookup: {
                        from: "adsplaces",
                        localField: "placingID",
                        foreignField: "_id",
                        as: "placeData"
                    }
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "userID",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },

                {
                    $project: {

                        place: {
                            $arrayElemAt: ['$placeData', 0]
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
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang'
                    }
                },

                {
                    $project: {


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
                        namePlace: '$place.namePlace',
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang'
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },


            ]).exec();
            return query;
        }
        else {
            let query = await this.adsModel.aggregate([
                {
                    $match: {
                        userID: userid,
                    }
                },
                {
                    $lookup: {
                        from: "adsplaces",
                        localField: "placingID",
                        foreignField: "_id",
                        as: "placeData"
                    }
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "userID",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },

                {
                    $project: {

                        place: {
                            $arrayElemAt: ['$placeData', 0]
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
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang'
                    }
                },

                {
                    $project: {


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
                        namePlace: '$place.namePlace',
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang'
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },


            ]).exec();
            return query;
        }

    }

    async listusevoucher(userid: ObjectID, status: any[], startdate: string, enddate: string, page: number, limit: number, descending: boolean): Promise<Ads[]> {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }
        var order = null;

        if (descending === true) {
            order = -1;
        } else {
            order = 1;
        }
        if (userid !== undefined && status !== undefined && startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        "userID": userid,
                        status: {
                            $in: status
                        },
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },
                {
                    $sort: {
                        timestamp: order
                    },

                },
                {
                    $skip: (page * limit)
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid !== undefined && status === undefined && startdate === undefined && enddate === undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        "userID": userid
                    }
                },
                {
                    $sort: {
                        timestamp: order
                    },

                },
                {
                    $skip: (page * limit)
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid === undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },
                {
                    $sort: {
                        timestamp: order
                    },

                },
                {
                    $skip: (page * limit)
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid === undefined && status !== undefined && startdate === undefined && enddate === undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {

                        status: {
                            $in: status
                        },

                    }
                },
                {
                    $sort: {
                        timestamp: order
                    },

                },
                {
                    $skip: (page * limit)
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid !== undefined && status !== undefined && startdate === undefined && enddate === undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        "userID": userid,
                        status: {
                            $in: status
                        },
                    }
                },
                {
                    $sort: {
                        timestamp: order
                    },

                },
                {
                    $skip: (page * limit)
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid !== undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        "userID": userid,
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },
                {
                    $sort: {
                        timestamp: order
                    },

                },
                {
                    $skip: (page * limit)
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid === undefined && status !== undefined && startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        status: {
                            $in: status
                        },
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },
                {
                    $sort: {
                        timestamp: order
                    },

                },
                {
                    $skip: (page * limit)
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        "userID": userid
                    }
                },
                {
                    $sort: {
                        timestamp: order
                    },

                },
                {
                    $skip: (page * limit)
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
    }

    async listusevouchercount(userid: ObjectID, status: string, startdate: string, enddate: string): Promise<Ads[]> {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }

        if (userid !== undefined && status !== undefined && startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        "userID": userid,
                        status: {
                            $in: status
                        },
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },

                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid !== undefined && status === undefined && startdate === undefined && enddate === undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        "userID": userid
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },

                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid === undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },

                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid === undefined && status !== undefined && startdate === undefined && enddate === undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {

                        status: {
                            $in: status
                        },

                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },

                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid !== undefined && status !== undefined && startdate === undefined && enddate === undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        "userID": userid,
                        status: {
                            $in: status
                        },
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },

                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid !== undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        "userID": userid,
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },

                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid === undefined && status !== undefined && startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        status: {
                            $in: status
                        },
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },

                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        "userID": userid
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },

                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
    }

}
