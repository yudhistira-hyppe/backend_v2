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
        var pipeline = new Array<any>(
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
                    userID: 1,
                    fullName: '$user.fullName',
                    email: '$user.email',
                    timestamp: 1,
                    expiredAt: 1,
                    gender: 1,
                    liveAt: 1,
                    name: 1,
                    description: 1,
                    objectifitas: 1,
                    status: 1,
                    totalClick: 1,
                    totalUsedCredit: 1,
                    totalView: 1,
                    urlLink: 1,
                    isActive: 1,
                    namePlace: '$placeData[0].namePlace',
                    idApsara: 1,
                    duration: 1,
                    tayang: 1,
                    type: 1
                }
            }
        );
        if (userid && userid !== undefined) {
            pipeline.push({ $match: { userID: userid } });
        }
        if (search && search !== undefined && search != "") {
            pipeline.push({
                $match: {
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
            });
        }
        if (startdate && startdate !== undefined) {
            pipeline.push({ $match: { timestamp: { $gte: startdate } } });
        }
        if (enddate && enddate !== undefined) {
            pipeline.push({ $match: { timestamp: { $lte: enddate } } });
        }
        if (skip > 0) {
            pipeline.push({ $skip: skip });
        }
        if (limit > 0) {
            pipeline.push({ $limit: limit });
        }
        pipeline.push({ $sort: { timestamp: -1 } });
        // const util = require('util');
        // console.log(util.inspect(pipeline, false, null, true));

        let query = await this.adsModel.aggregate(pipeline);
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
    async updatedata(
        id: string,
        CreateAdsDto: CreateAdsDto,
    ): Promise<Ads> {
        let data = await this.adsModel.findByIdAndUpdate(
            id,
            CreateAdsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async findAdsIDsByEmail(email: String) {
        var pipeline = [
            {
                $lookup: {
                    from: 'userbasics',
                    localField: 'userID',
                    foreignField: '_id',
                    as: 'basic'
                }
            },
            {
                $match: {
                    'basic.email': email
                }
            },
            {
                $project: {
                    _id: 1
                }
            }
        ];
        // const util = require('util');
        // console.log(util.inspect(pipeline, false, null, true /* enable colors */))
        const query = await this.adsModel.aggregate(pipeline);
        var adsIds = [];
        for (var i = 0; i < query.length; i++) {
            adsIds.push(query[i]._id);
        }
        return adsIds;
    }

    async findreportads(keys: string, postType: string, startdate: string, enddate: string, page: number, limit: number, startreport: number, endreport: number, status: any[], reason: any[], descending: boolean, reasonAppeal: any[], username: string) {
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
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var pipeline = [];
        pipeline = [

            {
                $lookup: {
                    from: 'userbasics',
                    localField: 'userID',
                    foreignField: '_id',
                    as: 'basicdata',

                }
            },
            {
                $addFields: {

                    'profilepictid': {
                        $arrayElemAt: ['$basicdata.profilePict.$id', 0]
                    },
                    'userAuth_id': { $arrayElemAt: ['$basicdata.userAuth.$id', 0] }
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
                    from: 'userauths',
                    localField: 'userAuth_id',
                    foreignField: '_id',
                    as: 'userAuth_data',
                },
            },
            {
                $addFields: {
                    'avatar': {
                        $arrayElemAt: ['$avatardata', 0]
                    },
                    'basic': {
                        $arrayElemAt: ['$basicdata', 0]
                    },
                    'auth': {
                        $arrayElemAt: ['$userAuth_data', 0]
                    },

                }
            },
            {
                $lookup: {
                    from: 'adsplaces',
                    localField: 'placingID',
                    foreignField: '_id',
                    as: 'places',

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
                $project: {
                    tipeads: {
                        $arrayElemAt: ['$tipeads', 0]
                    },
                    place: {
                        $arrayElemAt: ['$places', 0]
                    },
                    userID: 1,
                    email: '$basic.email',
                    fullName: '$basic.fullName',
                    username: '$auth.username',
                    idApsara: 1,
                    name: 1,
                    type: 1,
                    status: 1,
                    isActive: 1,
                    timestamp: 1,
                    totalUsedCredit: 1,
                    tayang: 1,
                    usedCredit: 1,
                    usedCreditFree: 1,
                    creditFree: 1,
                    creditValue: 1,
                    totalCredit: 1,
                    contentModeration: 1,
                    contentModerationResponse: 1,
                    reportedStatus: 1,
                    reportedUserCount: 1,
                    reportedUser: 1,
                    reportedUserHandle: 1,
                    reportReasonIdLast: {
                        $last: "$reportedUser.reportReasonId"
                    },
                    reasonLast: {
                        $last: "$reportedUser.description"
                    },
                    createdAtReportLast: {
                        $last: "$reportedUser.createdAt"
                    },
                    avatar: {
                        mediaBasePath: '$avatar.mediaBasePath',
                        mediaUri: '$avatar.mediaUri',
                        mediaType: '$avatar.mediaType',
                        mediaEndpoint: '$avatar.fsTargetUri',
                        medreplace: {
                            $replaceOne: {
                                input: "$avatar.mediaUri",
                                find: "_0001.jpeg",
                                replacement: ""
                            }
                        },

                    },

                }
            },
            {
                $addFields: {

                    concat: '/profilepict',
                    pict: {
                        $replaceOne: {
                            input: "$avatar.mediaUri",
                            find: "_0001.jpeg",
                            replacement: ""
                        }
                    },

                },

            },
            {

                $project: {
                    userID: 1,
                    email: 1,
                    fullName: 1,
                    username: 1,
                    idApsara: 1,
                    name: 1,
                    type: 1,
                    status: 1,
                    isActive: 1,
                    timestamp: 1,
                    totalUsedCredit: 1,
                    tayang: 1,
                    usedCredit: 1,
                    usedCreditFree: 1,
                    creditFree: 1,
                    creditValue: 1,
                    totalCredit: 1,
                    contentModeration: 1,
                    contentModerationResponse: 1,
                    reportedStatus: 1,
                    reportedUserCount: 1,
                    reportedUser: 1,
                    reportedUserHandle: 1,
                    reportReasonIdLast: 1,
                    reasonLast: 1,
                    createdAtReportLast: 1,
                    place: '$place.namePlace',
                    avatar: {
                        mediaBasePath: '$profilpict.mediaBasePath',
                        mediaUri: '$profilpict.mediaUri',
                        mediaType: '$profilpict.mediaType',
                        mediaEndpoint: {
                            $concat: ["$concat", "/", "$pict"]
                        },

                    },
                    lastAppeal: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$reportedUserHandle", null]
                                }, {
                                    $eq: ["$reportedUserHandle", ""]
                                }, {
                                    $eq: ["$reportedUserHandle", []]
                                }, {
                                    $eq: ["$reportedUserHandle", "Lainnya"]
                                }]
                            },
                            then: "Lainnya",
                            else: {
                                $last: "$reportedUserHandle.reason"
                            }
                        },

                    },
                    statusLast: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$reportedUserHandle", null]
                                }, {
                                    $eq: ["$reportedUserHandle", ""]
                                }, {
                                    $eq: ["$reportedUserHandle", []]
                                }]
                            },
                            then: "BARU",
                            else: {
                                $last: "$reportedUserHandle.status"
                            }
                        },

                    },

                }
            },
            {

                $project: {
                    userID: 1,
                    email: 1,
                    fullName: 1,
                    username: 1,
                    idApsara: 1,
                    name: 1,
                    type: 1,
                    status: 1,
                    isActive: 1,
                    timestamp: 1,
                    totalUsedCredit: 1,
                    tayang: 1,
                    usedCredit: 1,
                    usedCreditFree: 1,
                    creditFree: 1,
                    creditValue: 1,
                    totalCredit: 1,
                    contentModeration: 1,
                    contentModerationResponse: 1,
                    reportedStatus: 1,
                    reportedUserCount: 1,
                    reportedUser: 1,
                    reportedUserHandle: 1,
                    reportReasonIdLast: 1,
                    reasonLast: 1,
                    createdAtReportLast: 1,
                    place: 1,
                    avatar: 1,
                    statusLast: 1,
                    lastAppeal: 1,
                    reasonLastAppeal: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$lastAppeal", null]
                                }, {
                                    $eq: ["$lastAppeal", ""]
                                }, {
                                    $eq: ["$lastAppeal", "Lainnya"]
                                }]
                            },
                            then: "Lainnya",
                            else: {
                                $last: "$reportedUserHandle.reason"
                            }
                        },

                    },
                    reportStatusLast: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$statusLast", null]
                                }, {
                                    $eq: ["$statusLast", ""]
                                }, {
                                    $eq: ["$statusLast", []]
                                }, {
                                    $eq: ["$statusLast", "BARU"]
                                }]
                            },
                            then: "BARU",
                            else: {
                                $last: "$reportedUserHandle.status"
                            }
                        },

                    },

                }
            },
            {
                $match: {
                    reportedUser: {
                        $ne: null
                    },
                    reportReasonIdLast: {
                        $ne: null
                    },
                    isActive: true,

                }
            }
        ];


        if (keys && keys !== undefined) {

            pipeline.push({
                $match: {
                    name: {
                        $regex: keys,
                        $options: 'i'
                    },

                }
            },);

        }
        if (username && username !== undefined) {

            pipeline.push({
                $match: {
                    username: {
                        $regex: username,
                        $options: 'i'
                    },

                }
            },);

        }
        if (postType && postType !== undefined) {
            pipeline.push({
                $match: {
                    tipeads: {
                        $regex: postType,
                        $options: 'i'
                    },

                }
            });
        }
        if (startdate && startdate !== undefined) {
            pipeline.push({ $match: { createdAtReportLast: { "$gte": startdate } } });
        }
        if (enddate && enddate !== undefined) {
            pipeline.push({ $match: { createdAtReportLast: { "$lte": dateend } } });
        }
        if (startreport && startreport !== undefined) {
            pipeline.push({ $match: { reportedUserCount: { "$gte": startreport } } });
        }
        if (endreport && endreport !== undefined) {
            pipeline.push({ $match: { reportedUserCount: { "$lte": endreport } } });
        }
        if (status && status !== undefined) {

            pipeline.push(
                {
                    $match: {
                        $or: [
                            {
                                reportStatusLast: {
                                    $in: status
                                }
                            },

                        ]
                    }
                },
            );

        }
        if (reason && reason !== undefined) {

            let reasonsleng = reason.length;
            let arrayReason = [];
            for (var i = 0; i < reasonsleng; i++) {
                var id = reason[i];
                var idreason = mongoose.Types.ObjectId(id);
                arrayReason.push(idreason);
            }
            pipeline.push(
                {
                    $match: {
                        $or: [
                            {
                                reportReasonIdLast: {
                                    $in: arrayReason
                                }
                            },

                        ]
                    }
                });

        }
        if (reasonAppeal && reasonAppeal !== undefined) {

            pipeline.push(
                {
                    $match: {
                        $or: [
                            {
                                reasonLastAppeal: {
                                    $in: reasonAppeal
                                }
                            },

                        ]
                    }
                });

        }
        pipeline.push({
            $sort: {
                createdAtReportLast: order
            },

        });
        if (page > 0) {
            pipeline.push({ $skip: (page * limit) });
        }
        if (limit > 0) {
            pipeline.push({ $limit: limit });
        }
        const query = await this.adsModel.aggregate(pipeline);

        return query;
    }
    async countReason(id: Object) {
        let query = await this.adsModel.aggregate([
            {
                $match: {

                    _id: id
                }
            },
            {
                $unwind: "$reportedUser"
            },
            {
                $match: {

                    'reportedUser.active': true
                }
            },
            {
                $group: {
                    _id: "$reportedUser.description",

                    myCount: {
                        $sum: 1
                    }
                }
            },
            {
                $project: {
                    _id: "$_id",
                    "myCount": "$myCount",

                }
            }

        ]);
        return query;
    }

    async detailadsreport(adsID: Object) {
        let query = await this.adsModel.aggregate([

            {
                $match: {
                    _id: adsID

                }
            },
            {
                $lookup: {
                    from: 'adsplaces',
                    localField: 'placingID',
                    foreignField: '_id',
                    as: 'places',

                },

            },
            {
                $lookup: {
                    from: "userbasics",
                    as: "basicdata",
                    let: {
                        local_id: '$userID'
                    },
                    pipeline: [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$_id', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                fullName: '$fullName',
                                email: '$email',
                                isIdVerified: '$isIdVerified',
                                profilepictid: '$profilePict.$id',
                                proofpictid: '$proofPict.$id'
                            }
                        }
                    ],

                }
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
                $lookup: {
                    from: "interests_repo",
                    as: "interest",
                    let: {
                        local_id: '$interestID.$id'
                    },
                    pipeline: [
                        {
                            $match:
                            {


                                $expr: {
                                    $in: ['$_id', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                interestName: '$interestName'
                            }
                        }
                    ],

                }
            },

            {
                $project: {
                    tipeads: {
                        $arrayElemAt: ['$tipeads', 0]
                    },
                    place: {
                        $arrayElemAt: ['$places', 0]
                    },
                    basic: {
                        $arrayElemAt: ['$basicdata', 0]
                    },
                    userID: 1,
                    idApsara: 1,
                    name: 1,
                    type: 1,
                    status: 1,
                    timestamp: 1,
                    totalUsedCredit: 1,
                    tayang: 1,
                    usedCredit: 1,
                    usedCreditFree: 1,
                    creditFree: 1,
                    creditValue: 1,
                    totalCredit: 1,
                    contentModeration: 1,
                    contentModerationResponse: 1,
                    reportedStatus: 1,
                    reportedUserCount: 1,
                    reportedUser: 1,
                    reportedUserHandle: 1,
                    interest: 1,
                    reportReasonIdLast: {
                        $last: "$reportedUser.reportReasonId"
                    },
                    reasonLast: {
                        $last: "$reportedUser.description"
                    },
                    createdAtReportLast: {
                        $last: "$reportedUser.createdAt"
                    },

                }
            },

            {

                $project: {

                    userID: 1,
                    idApsara: 1,
                    name: 1,
                    type: 1,
                    status: 1,
                    timestamp: 1,
                    totalUsedCredit: 1,
                    tayang: 1,
                    usedCredit: 1,
                    usedCreditFree: 1,
                    creditFree: 1,
                    creditValue: 1,
                    totalCredit: 1,
                    contentModeration: 1,
                    contentModerationResponse: 1,
                    reportedStatus: 1,
                    reportedUser: 1,
                    reportedUserHandle: 1,
                    reportedUserCount: 1,
                    place: '$place.namePlace',
                    statusLast: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$reportedUserHandle", null]
                                }, {
                                    $eq: ["$reportedUserHandle", ""]
                                }, {
                                    $eq: ["$reportedUserHandle", []]
                                }]
                            },
                            then: "BARU",
                            else: {
                                $last: "$reportedUserHandle.status"
                            }
                        },

                    },
                    interest: 1,
                    fullName: '$basic.fullName',
                    email: '$basic.email',
                    isIdVerified: '$basic.isIdVerified',
                    profilepictid: '$basic.profilepictid',
                    proofpictid: '$basic.proofpictid',

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
                "$lookup": {
                    from: "mediaproofpicts",
                    as: "proofpict",
                    let: {
                        local_id: '$proofpictid'
                    },
                    pipeline: [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$_id', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {
                                createdAt: '$createdAt',
                                nama: '$nama'
                            }
                        }
                    ],

                }
            },
            {

                $project: {

                    userID: 1,
                    idApsara: 1,
                    name: 1,
                    type: 1,
                    status: 1,
                    timestamp: 1,
                    totalUsedCredit: 1,
                    tayang: 1,
                    usedCredit: 1,
                    usedCreditFree: 1,
                    creditFree: 1,
                    creditValue: 1,
                    totalCredit: 1,
                    contentModeration: 1,
                    contentModerationResponse: 1,
                    reportedStatus: 1,
                    reportedUser: 1,
                    reportedUserHandle: 1,
                    reportedUserCount: 1,
                    place: 1,
                    statusLast: 1,
                    reportStatusLast: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$statusLast", null]
                                }, {
                                    $eq: ["$statusLast", ""]
                                }, {
                                    $eq: ["$statusLast", []]
                                }, {
                                    $eq: ["$statusLast", "BARU"]
                                }]
                            },
                            then: "BARU",
                            else: {
                                $last: "$reportedUserHandle.status"
                            }
                        },

                    },
                    interest: 1,
                    fullName: 1,
                    email: 1,
                    isIdVerified: 1,
                    avatardata: 1,
                    proofpict: 1,
                }
            },
            {
                $addFields: {
                    avatar: {
                        $arrayElemAt: ['$avatardata', 0]
                    },
                    pathavatar: '/profilepict',

                }
            },
            {

                $project: {

                    userID: 1,
                    idApsara: 1,
                    name: 1,
                    type: 1,
                    status: 1,
                    timestamp: 1,
                    totalUsedCredit: 1,
                    tayang: 1,
                    usedCredit: 1,
                    usedCreditFree: 1,
                    creditFree: 1,
                    creditValue: 1,
                    totalCredit: 1,
                    contentModeration: 1,
                    contentModerationResponse: 1,
                    reportedStatus: 1,
                    reportedUser: 1,
                    reportedUserHandle: 1,
                    reportedUserCount: 1,
                    place: 1,
                    reportStatusLast: 1,
                    interest: 1,
                    fullName: 1,
                    statusUser:
                    {
                        $cond: {
                            if: {
                                $eq: ["$isIdVerified", true]
                            },
                            then: "PREMIUM",
                            else: "BASIC"
                        }
                    },

                    email: 1,
                    avatar: {
                        mediaBasePath: '$avatar.mediaBasePath',
                        mediaUri: '$avatar.mediaUri',
                        mediaType: '$avatar.mediaType',
                        mediaEndpoint: '$avatar.fsTargetUri',
                        medreplace: {
                            $replaceOne: {
                                input: "$avatar.mediaUri",
                                find: "_0001.jpeg",
                                replacement: ""
                            }
                        },

                    },
                    proofpict: 1,

                }
            },
        ]);
        return query;
    }

    async updateDitangguhkan(id: ObjectID, reason: string, updatedAt: string, reasonId: ObjectID) {
        let data = await this.adsModel.updateMany({ "_id": id },
            { $set: { "reportedStatus": "OWNED", "updatedAt": updatedAt, "reportedUserHandle.$[].reasonId": reasonId, "reportedUserHandle.$[].reasonAdmin": reason, "reportedUserHandle.$[].status": "DITANGGUHKAN", "reportedUserHandle.$[].updatedAt": updatedAt } });
        return data;
    }

    async updateDitangguhkanEmpty(id: ObjectID, updatedAt: string, reportedUserHandle: any[]) {
        let data = await this.adsModel.updateMany({ "_id": id },
            { $set: { "reportedStatus": "OWNED", "updatedAt": updatedAt, "reportedUserHandle": reportedUserHandle } });
        return data;
    }
    async updateFlaging(id: ObjectID, updatedAt: string) {
        let data = await this.adsModel.updateMany({ "_id": id },
            { $set: { "reportedStatus": "BLURRED", "updatedAt": updatedAt, "reportedUserHandle.$[].status": "FLAGING", "reportedUserHandle.$[].updatedAt": updatedAt } });
        return data;
    }
    async updateFlagingEmpty(id: ObjectID, updatedAt: string, reportedUserHandle: any[]) {
        let data = await this.adsModel.updateMany({ "_id": id },
            { $set: { "reportedStatus": "BLURRED", "updatedAt": updatedAt, "reportedUserHandle": reportedUserHandle } });
        return data;
    }
    async updateTidakditangguhkan(id: ObjectID, updatedAt: string) {
        let data = await this.adsModel.updateMany({ "_id": id },
            { $set: { "reportedStatus": "ALL", "updatedAt": updatedAt, "reportedUserCount": 0, "reportedUserHandle.$[].status": "TIDAK DITANGGUHKAN", "reportedUserHandle.$[].updatedAt": updatedAt } });
        return data;
    }
    async updateTidakditangguhkanEmpty(id: ObjectID, updatedAt: string, reportedUserHandle: any[]) {
        let data = await this.adsModel.updateMany({ "_id": id },
            { $set: { "reportedStatus": "ALL", "updatedAt": updatedAt, "reportedUserCount": 0, "reportedUserHandle": reportedUserHandle } });
        return data;
    }
    async nonactive(id: ObjectID, updatedAt: string) {
        let data = await this.adsModel.updateMany({ "_id": id },
            {
                $set: {
                    "reportedUser.$[].active": false, "reportedUser.$[].updatedAt": updatedAt
                }


            });
        return data;
    }

    async updateActive(id: ObjectID, updatedAt: string, remark: string) {
        let data = await this.adsModel.updateMany({ "_id": id },

            { $set: { "active": false, "updatedAt": updatedAt, "reportedUserHandle.$[].remark": remark, "reportedUserHandle.$[].status": "DELETE", "reportedUserHandle.$[].updatedAt": updatedAt } });
        return data;
    }

    async updateActiveEmpty(id: ObjectID, updatedAt: string, reportedUserHandle: any[]) {
        let data = await this.adsModel.updateMany({ "_id": id },

            { $set: { "isActive": false, "updatedAt": updatedAt, "reportedUserHandle": reportedUserHandle } });
        return data;
    }

}
