import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { Model, Types } from 'mongoose';
import { CreateUserAdsDto } from './dto/create-userads.dto';
import { UserAds, UserAdsDocument } from './schemas/userads.schema';
import { MediaprofilepictsService } from '../../content/mediaprofilepicts/mediaprofilepicts.service';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from 'src/utils/utils.service';
@Injectable()
export class UserAdsService {
    constructor(@InjectModel(UserAds.name, 'SERVER_FULL')
    private readonly userAdsModel: Model<UserAdsDocument>, 
        private readonly mediaprofilepictsService: MediaprofilepictsService,
        private readonly utilsService: UtilsService,
        private readonly configService: ConfigService,
    ) { }

    async create(CreateUserAdsDto: CreateUserAdsDto): Promise<UserAds> {
        const createUserbasicDto = await this.userAdsModel.create(
            CreateUserAdsDto,
        );
        return createUserbasicDto;
    }

    async findAll(): Promise<UserAds[]> {
        return this.userAdsModel.find().exec();
    }

    async findAllLimit(limit: number): Promise<UserAds[]> {
        return this.userAdsModel.find().sort({ priorityNumber: 1 }).limit(limit).exec();
    }

    async findOne(id: string): Promise<UserAds> {
        return this.userAdsModel.findOne({ _id: new ObjectId(id) }).exec();
    }

    async findOnestatusView(id: string): Promise<UserAds> {
        return this.userAdsModel.findOne({ _id: new ObjectId(id), statusView: false }).exec();
    }

    async findOneByuserID(userID: string, nameType: string, date?: string): Promise<UserAds[]> {
        return this.userAdsModel.find({
            userID: userID, nameType: nameType, statusView: false, isActive: true, liveAt: {
                $lte: date
            }
        }).sort({ priorityNumber: -1, createdAt: -1 }).exec();
    }

    async findAdsIDUserID(userID: string, adsID: string): Promise<UserAds> {
        return this.userAdsModel.findOne({ adsID: new ObjectId(adsID), userID: new ObjectId(userID) }).exec();
    }

    async findUserAdsRewars(userID: string, adsID: string, AdsSkip: number): Promise<UserAds> {
        return this.userAdsModel.findOne({ adsID: new ObjectId(adsID), userID: new ObjectId(userID), $or: [{ statusClick: true }, { statusView: true }] }).exec();
    }

    async getAdsUser(id: string): Promise<UserAds> {
        return this.userAdsModel.findOne({ _id: new ObjectId(id) }).exec();
    }

    async findOneByuserIDAds(userID: string, adsId: string): Promise<UserAds> {
        return this.userAdsModel.findOne({ userID: userID, adsID: adsId, statusView: false }).exec();
    }

    // async findAdsid(adsID: ObjectId): Promise<UserAds> {
    //     return this.userAdsModel.findOne({ adsID: adsID }).exec();
    // }

    async findAdsid(adsID: ObjectId) {
        const query = await this.userAdsModel.aggregate([

            {
                $match: {
                    adsID: adsID
                }
            },

        ]);
        return query;
    }

    async updateData(
        _id: string,
        createUserAdsDto: any,
    ): Promise<UserAds> {
        let data = await this.userAdsModel.findByIdAndUpdate(
            _id,
            createUserAdsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async update(
        _id: string,
        createUserAdsDto: CreateUserAdsDto,
    ): Promise<UserAds> {
        let data = await this.userAdsModel.findByIdAndUpdate(
            _id,
            createUserAdsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async updatesdata(adsID: Types.ObjectId, createUserAdsDto: CreateUserAdsDto): Promise<Object> {
        let data = await this.userAdsModel.updateOne({ "adsID": adsID },
            { $set: { "statusClick": createUserAdsDto.statusClick, "statusView": createUserAdsDto.statusView, "viewAt": createUserAdsDto.viewAt, "viewed": createUserAdsDto.viewed, "clickAt": createUserAdsDto.clickAt } });
        return data;
    }

    async useradslistbyads(adsID: Types.ObjectId) {


        const query = await this.userAdsModel.aggregate([

            {
                $match: {
                    "adsID": adsID
                }
            }, {
                $lookup: {
                    from: 'userbasics',
                    localField: 'userID',
                    foreignField: '_id',
                    as: 'userbasics_data',

                },

            }, {
                $project: {
                    user: {
                        $arrayElemAt: ['$userbasics_data', 0]
                    },
                    clickAt: '$clickAt',
                    createdAt: '$createdAt',
                    description: '$description',
                    priority: '$priority',
                    statusClick: '$statusClick',
                    statusView: '$statusView',
                    updatedAt: '$updatedAt',
                    viewAt: '$viewAt',
                    viewed: '$viewed'
                }
            }, {
                $project: {

                    profilpictid: '$user.profilePict.$id',
                    fullName: '$user.fullName',
                    clickAt: '$clickAt',
                    createdAt: '$createdAt',
                    description: '$description',
                    priority: '$priority',
                    statusClick: '$statusClick',
                    statusView: '$statusView',
                    updatedAt: '$updatedAt',
                    viewAt: '$viewAt',
                    viewed: '$viewed'
                }
            }, {
                $lookup: {
                    from: 'mediaprofilepicts',
                    localField: 'profilpictid',
                    foreignField: '_id',
                    as: 'profilePict_data',

                },

            }, {
                $project: {
                    profilpict: {
                        $arrayElemAt: ['$profilePict_data', 0]
                    },
                    fullName: '$fullName',
                    clickAt: '$clickAt',
                    createdAt: '$createdAt',
                    description: '$description',
                    priority: '$priority',
                    statusClick: '$statusClick',
                    statusView: '$statusView',
                    updatedAt: '$updatedAt',
                    viewAt: '$viewAt',
                    viewed: '$viewed',
                    avatar: {
                        mediaBasePath: '$profilpict.mediaBasePath',
                        mediaUri: '$profilpict.mediaUri',
                        mediaType: '$profilpict.mediaType',
                        mediaEndpoint: '$profilpict.fsTargetUri',
                        medreplace: {
                            $replaceOne: {
                                input: "$profilpict.mediaUri",
                                find: "_0001.jpeg",
                                replacement: ""
                            }
                        },

                    },
                }
            }, {
                $addFields: {

                    concat: '/profilepict',
                    pict: {
                        $replaceOne: {
                            input: "$profilpict.mediaUri",
                            find: "_0001.jpeg",
                            replacement: ""
                        }
                    },

                },

            }, {
                $project: {
                    fullName: '$fullName',
                    clickAt: '$clickAt',
                    createdAt: '$createdAt',
                    description: '$description',
                    priority: '$priority',
                    statusClick: '$statusClick',
                    statusView: '$statusView',
                    updatedAt: '$updatedAt',
                    viewAt: '$viewAt',
                    viewed: '$viewed',
                    concat: '$concat',
                    pict: '$pict',
                    avatar: {
                        mediaBasePath: '$profilpict.mediaBasePath',
                        mediaUri: '$profilpict.mediaUri',
                        mediaType: '$profilpict.mediaType',
                        mediaEndpoint: '$profilpict.fsTargetUri',
                        medreplace: {
                            $replaceOne: {
                                input: "$profilpict.mediaUri",
                                find: "_0001.jpeg",
                                replacement: ""
                            }
                        },

                    },

                }
            },
            {
                $project: {
                    fullName: '$fullName',
                    clickAt: '$clickAt',
                    createdAt: '$createdAt',
                    description: '$description',
                    priority: '$priority',
                    statusClick: '$statusClick',
                    statusView: '$statusView',
                    updatedAt: '$updatedAt',
                    viewAt: '$viewAt',
                    viewed: '$viewed',

                    avatar: {
                        mediaBasePath: '$avatar.mediaBasePath',
                        mediaUri: '$avatar.mediaUri',
                        mediaType: '$avatar.mediaType',
                        mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

                    },

                }
            },
            {
                $sort: {
                    createdAt: - 1
                },

            },
        ]);
        return query;
    }

    async updatesdataUserId(adsID: string, userID: string, createUserAdsDto: CreateUserAdsDto): Promise<Object> {
        let data = await this.userAdsModel.updateOne(
            {
                "adsID": adsID,
                "userID": userID
            },
            {
                $set: {
                    "statusClick": createUserAdsDto.statusClick,
                    "statusView": createUserAdsDto.statusView,
                    "viewAt": createUserAdsDto.viewAt,
                    "viewed": createUserAdsDto.viewed,
                    "clickAt": createUserAdsDto.clickAt
                }
            });
        return data;
    }

    async updateUpdateAt(_id: string, datetime: string) {
        return await this.userAdsModel.updateOne({ _id: new ObjectId(_id) }, { $push: { updateAt: datetime } }).exec();
    }

    async updateClickTime(_id: string, datetime: string) {
        return await this.userAdsModel.updateOne({ _id: new ObjectId(_id) }, { $push: { clickTime: datetime } }).exec();
    }

    async updatesdataUserId_(id: string, createUserAdsDto: CreateUserAdsDto): Promise<Object> {
        let data = await this.userAdsModel.updateOne(
            {
                "_id": new ObjectId(id)
            },
            {
                $set: createUserAdsDto,
            });
        return data;
    }

    async updatesAlladsNotActive(adsID: string, createUserAdsDto: CreateUserAdsDto): Promise<Object> {
        let data = await this.userAdsModel.updateMany(
            {
                "adsID": new ObjectId(adsID)
            },
            {
                $set: createUserAdsDto
            });
        return data;
    }

    async updatesdataAdsID(adsID: string, createUserAdsDto: CreateUserAdsDto): Promise<Object> {
        let data = await this.userAdsModel.updateMany(
            {
                "adsID": adsID
            },
            {
                $set: {
                    "statusClick": createUserAdsDto.statusClick,
                    "statusView": createUserAdsDto.statusView,
                    "viewAt": createUserAdsDto.viewAt,
                    "viewed": createUserAdsDto.viewed,
                    "clickAt": createUserAdsDto.clickAt
                }
            });
        return data;
    }

    async findByAdsIDsDate(adsIDs: Array<any>, startdate: String, enddate: String) {
        var thisyear = new Date().getFullYear();
        // thisyear=parseInt(thisyear);
        var pipeline = [];
        pipeline = [
            {
                '$lookup': {
                    from: 'userbasics',
                    localField: 'userID',
                    foreignField: '_id',
                    as: 'basic'
                }
            },
            {
                '$unwind': {
                    path: '$basic',
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $addFields: {
                    areaid: '$basic.states.$id'
                }
            },
            {
                '$lookup': {
                    from: 'areas',
                    localField: 'areaid',
                    foreignField: '_id',
                    as: 'area'
                }
            },
            {
                '$unwind': {
                    path: '$area',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                '$addFields': {
                    date: { '$substr': ['$createdAt', 0, 10] },
                    yob: { '$substr': ['$basic.dob', 0, 4] }
                }
            },
            {
                '$addFields': {
                    age: {
                        $switch: {
                            branches: [
                                { case: { $or: [{ $eq: ['$yob', ''] }, { $eq: ['$yob', null] }] }, then: '0' }
                            ],
                            default: { '$subtract': [2022, { $toInt: '$yob' }] }
                        },

                    }
                }
            },
            {
                $match: {
                    adsID: { $in: adsIDs },
                    $or: [{ statusClick: true }, { statusView: true }],
                    date: { $gte: startdate, $lte: enddate }
                }
            },
            {
                $project: {
                    _id: 0, date: 1, statusClick: 1, statusView: 1, gender: '$basic.gender', age: '$age', area: '$area.stateName'
                }
            }
        ];
        const util = require('util');
       // console.log(util.inspect(pipeline, false, null, true /* enable colors */))

        let data = await this.userAdsModel.aggregate(pipeline);
        return data;
    }

    async groupByDateActivity(ads: Array<any>) {
        var grouped = [];
        for (var i = 0; i < ads.length; i++) {
            var idx = grouped.findIndex(x => x.date == ads[i].date);
            if (idx == -1) {
                if (ads[i].statusClick)
                    grouped.push({ 'date': ads[i].date, 'cta': 1, 'view': 0 });
                else if (ads[i].statusView)
                    grouped.push({ 'date': ads[i].date, 'cta': 0, 'view': 1 });
            }
            else {
                if (ads[i].statusClick)
                    grouped[idx].cta++;
                else if (ads[i].statusView)
                    grouped[idx].view++;
            }

        }
        return grouped;
    }
    async groupBy(ads: Array<any>, groupBy: String) {
        var grouped = [];
        if (groupBy == 'area') {
            for (var i = 0; i < ads.length; i++) {
                var idx = grouped.findIndex(x => x.area == ads[i].area);
                if (idx == -1) {
                    grouped.push({ 'area': ads[i].area, 'count': 1 });
                }
                else {
                    grouped[idx].count++;
                }

            }
            return grouped;
        }
        else if (groupBy == 'gender') {
            for (var i = 0; i < ads.length; i++) {
                var idx = grouped.findIndex(x => x.gender == ads[i].gender);
                if (idx == -1) {
                    grouped.push({ 'gender': ads[i].gender, 'count': 1 });
                }
                else {
                    grouped[idx].count++;
                }

            }
            return grouped;
        }
        else if (groupBy == 'age') {
            grouped.push({ agemax: 17, count: 0 });
            grouped.push({ agemax: 24, count: 0 });
            grouped.push({ agemax: 34, count: 0 });
            grouped.push({ agemax: 54, count: 0 });
            grouped.push({ agemax: 999, count: 0 });

            for (var i = 0; i < ads.length; i++) {
                var idx = grouped.findIndex(x => x.agemax >= ads[i].age);
                if (idx > -1) {
                    grouped[idx].count++;
                }

            }
            return grouped;
        }
    }

    async countViewads(adsID: ObjectId) {
        let query = await this.userAdsModel.aggregate([

            {
                $match: {

                    adsID: adsID,
                    statusView: true
                }
            },

            {
                $group: {
                    _id: "$adsID",

                    myCount: {
                        $sum: 1
                    }
                }
            },
            {
                $project: {
                    _id: "$_id",
                    "totalView": "$myCount",

                }
            }
        ]);
        return query;
    }

    async countKlikads(adsID: ObjectId) {
        let query = await this.userAdsModel.aggregate([

            {
                $match: {

                    adsID: adsID,
                    statusClick: true
                }
            },

            {
                $group: {
                    _id: "$adsID",

                    myCount: {
                        $sum: 1
                    }
                }
            },
            {
                $project: {
                    _id: "$_id",
                    "totalClick": "$myCount",

                }
            }
        ]);
        return query;
    }

    async detailView(iduser: ObjectId, startdate: string, enddate: string) {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }

        var pipeline = [];
        pipeline.push(
            {
                $match: {

                    statusView: true
                }
            },);

        if (startdate && startdate !== undefined) {
            pipeline.push({
                $match: {
                    createdAt: { $gte: startdate }

                }
            },);
        }

        if (enddate && enddate !== undefined) {
            pipeline.push({
                $match: {
                    createdAt: { $lte: dateend }

                }
            },);
        }

        pipeline.push(
            {
                $lookup: {
                    from: "ads",
                    localField: "adsID",
                    foreignField: "_id",
                    as: "adsdata"
                }
            },
            {
                $unwind: "$adsdata"
            },
            {
                $match: {

                    'adsdata.userID': iduser
                }
            },
            {
                $group: {
                    _id: {
                        tanggal: {
                            $substrCP: [
                                "$createdAt",
                                0,
                                10
                            ]
                        }
                    },
                    total: {
                        $sum: 1
                    }
                }
            }, {
            $project: {
                _id: 0,
                date: "$_id.tanggal",
                total: 1,

            }
        }, {
            $sort: {
                date: 1
            }
        },
        );

        let query = await this.userAdsModel.aggregate(pipeline);
        return query;
    }

    async detailClick(iduser: ObjectId, startdate: string, enddate: string) {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }

        var pipeline = [];
        pipeline.push({
            $match: {

                statusClick: true
            }
        },);

        if (startdate && startdate !== undefined) {
            pipeline.push({
                $match: {
                    createdAt: { $gte: startdate }

                }
            },);
        }

        if (enddate && enddate !== undefined) {
            pipeline.push({
                $match: {
                    createdAt: { $lte: dateend }

                }
            },);
        }

        pipeline.push({
            $lookup: {
                from: "ads",
                localField: "adsID",
                foreignField: "_id",
                as: "adsdata"
            }
        },
            {
                $unwind: "$adsdata"
            },
            {
                $match: {

                    'adsdata.userID': iduser
                }
            },
            {
                $group: {
                    _id: {
                        tanggal: {
                            $substrCP: [
                                "$createdAt",
                                0,
                                10
                            ]
                        }
                    },
                    total: {
                        $sum: 1
                    }
                }
            }, {
            $project: {
                _id: 0,
                date: "$_id.tanggal",
                total: 1,

            }
        }, {
            $sort: {
                date: 1
            }
        },
        );

        let query = await this.userAdsModel.aggregate(pipeline);
        return query;
    }

    async listpenonton(idads: string, startdate: string, enddate: string, startage: number, endage: number, listgender: any[], listarea: any[], listpriority: any[], searchname: string, limit: number, page: number) {
        var pipeline = [];
        pipeline.push(
            {
                $match: {
                    "adsID": new Types.ObjectId(idads)

                }
            },
            {
                "$unwind":
                {
                    path: "$updateAt",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    "adsID": 1,
                    "createdAt": '$updateAt',
                    "description": 1,
                    "priority": 1,
                    "priorityNumber": 1,
                    "statusClick": 1,
                    "statusView": 1,
                    "userID": 1,
                    "liveAt": 1,
                    "viewed": 1,
                    "liveTypeuserads": 1,
                    "adstypesId": 1,
                    "isActive": 1,
                    "updateAt": 1,
                    "clickAt": 1,
                    "timeViewSecond": 1
                }
            },
            {
                $match: {
                    "viewed": { "$ne": 0 }

                }
            },
            {
                $lookup: {
                    from: 'userbasics',
                    localField: 'userID',
                    foreignField: '_id',
                    as: 'userbasics_data',

                },

            },
            {
                $lookup: {
                    from: 'areas',
                    localField: 'userbasics_data.states.$id',
                    foreignField: '_id',
                    as: 'areas_data',

                },

            },
            {
                $lookup: {
                    from: 'ads',
                    localField: 'adsID',
                    foreignField: '_id',
                    as: 'adsdata',

                },

            },
            {
                $set: {
                    age: {
                        $cond: {
                            if: {
                                $and: [{
                                    $arrayElemAt: ["$userbasics_data.dob", 0]
                                }, {
                                    $ne: [{
                                        $arrayElemAt: ["$userbasics_data.dob", 0]
                                    }, ""]
                                }]
                            },
                            then: {
                                $toInt: {
                                    $divide: [{
                                        $subtract: [new Date(), {
                                            $toDate: {
                                                $arrayElemAt: ["$userbasics_data.dob", 0]
                                            }
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
                $project: {
                    user: {
                        $arrayElemAt: ['$userbasics_data', 0]
                    },
                    areas:
                    {
                        $cond: {
                            if: {
                                $eq: ['$areas_data', []]
                            },
                            then: "OTHER",
                            else: {
                                $arrayElemAt: ["$areas_data.stateName", 0]
                            },

                        }
                    },
                    areasId:
                    {
                        $cond: {
                            if: {
                                $eq: ['$areas_data', []]
                            },
                            then: "",
                            else: {
                                $arrayElemAt: ["$areas_data._id", 0]
                            },

                        }
                    },
                    adsID: 1,
                    age: 1,
                    clickAt: 1,
                    createdAt: 1,
                    description: 1,
                    priority: 1,
                    statusClick: 1,
                    statusView: 1,
                    updatedAt: 1,
                    viewAt: 1,
                    viewed: 1,
                    name: {
                        $arrayElemAt: ['$adsdata.name', 0]
                    },
                    typeid: {
                        $arrayElemAt: ['$adsdata.typeAdsID', 0]
                    },

                }
            },
            {
                $lookup: {
                    from: 'adstypes',
                    localField: 'typeid',
                    foreignField: '_id',
                    as: 'typeads',

                },

            },
            {
                $project: {

                    profilpictid: '$user.profilePict.$id',
                    fullName: '$user.fullName',
                    clickAt: 1,
                    createdAt: 1,
                    description: 1,
                    priority: 1,
                    statusClick: 1,
                    statusView: {
                        $cond: {
                            if: {
                                $eq: ["$statusClick", true]
                            },
                            then: true,
                            else: '$statusView'
                        }
                    },
                    updatedAt: 1,
                    viewAt: 1,
                    viewed: 1,
                    name: 1,
                    adsID: 1,
                    age: 1,
                    areas: 1,
                    areasId: 1,
                    gender: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: ['$user.gender', 'FEMALE']
                                    },
                                    then: 'FEMALE',

                                },
                                {
                                    case: {
                                        $eq: ['$user.gender', ' FEMALE']
                                    },
                                    then: 'FEMALE',

                                },
                                {
                                    case: {
                                        $eq: ['$user.gender', 'Perempuan']
                                    },
                                    then: 'FEMALE',

                                },
                                {
                                    case: {
                                        $eq: ['$user.gender', 'Wanita']
                                    },
                                    then: 'FEMALE',

                                },
                                {
                                    case: {
                                        $eq: ['$user.gender', 'MALE']
                                    },
                                    then: 'MALE',

                                },
                                {
                                    case: {
                                        $eq: ['$user.gender', ' MALE']
                                    },
                                    then: 'MALE',

                                },
                                {
                                    case: {
                                        $eq: ['$user.gender', 'Laki-laki']
                                    },
                                    then: 'MALE',

                                },
                                {
                                    case: {
                                        $eq: ['$user.gender', 'Pria']
                                    },
                                    then: 'MALE',

                                },

                            ],
                            default: "OTHER",

                        },

                    },
                    typeads: {
                        $arrayElemAt: ['$typeads.nameType', 0]
                    },
                    valueType: {
                        $arrayElemAt: ['$typeads.creditValue', 0]
                    },

                }
            },
            {
                $lookup: {
                    from: 'mediaprofilepicts',
                    localField: 'profilpictid',
                    foreignField: '_id',
                    as: 'profilePict_data',

                },

            },
            {
                $project: {
                    profilpict: {
                        $arrayElemAt: ['$profilePict_data', 0]
                    },
                    gender: 1,
                    fullName: 1,
                    clickAt: 1,
                    createdAt: 1,
                    description: 1,
                    priority: 1,
                    statusClick: 1,
                    statusView: 1,
                    updatedAt: 1,
                    viewAt: 1,
                    viewed: 1,
                    name: 1,
                    typeads: 1,
                    valueType: 1,
                    adsID: 1,
                    age: 1,
                    areas: 1,
                    areasId: 1,
                    avatar: {
                        mediaBasePath: '$profilpict.mediaBasePath',
                        mediaID: '$profilpict.mediaID',
                        mediaUri: '$profilpict.mediaUri',
                        mediaType: '$profilpict.mediaType',
                        mediaEndpoint: '$profilpict.fsTargetUri',
                        medreplace: {
                            $replaceOne: {
                                input: "$profilpict.mediaUri",
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
                            input: "$profilpict.mediaUri",
                            find: "_0001.jpeg",
                            replacement: ""
                        }
                    },

                },

            },
            {
                $project: {
                    fullName: 1,
                    clickAt: 1,
                    createdAt: 1,
                    description: 1,
                    priority: 1,
                    statusClick: 1,
                    statusView: 1,
                    updatedAt: 1,
                    viewAt: 1,
                    viewed: 1,
                    name: 1,
                    adsID: 1,
                    age: 1,
                    gender: 1,
                    typeads: 1,
                    valueType: 1,
                    concat: '$concat',
                    pict: '$pict',
                    areas: 1,
                    areasId: 1,
                    avatar: {
                        mediaBasePath: '$profilpict.mediaBasePath',
                        mediaUri: '$profilpict.mediaUri',
                        mediaID: '$profilpict.mediaID',
                        mediaType: '$profilpict.mediaType',
                        mediaEndpoint: '$profilpict.fsTargetUri',
                        medreplace: {
                            $replaceOne: {
                                input: "$profilpict.mediaUri",
                                find: "_0001.jpeg",
                                replacement: ""
                            }
                        },

                    },

                }
            },
            {
                $project: {
                    fullName: 1,
                    clickAt: 1,
                    createdAt: 1,
                    description: 1,
                    priority: 1,
                    statusClick: 1,
                    statusView: 1,
                    updatedAt: 1,
                    viewAt: 1,
                    viewed: 1,
                    name: 1,
                    gender: 1,
                    typeads: 1,
                    valueType: 1,
                    adsID: 1,
                    age: 1,
                    areas: 1,
                    areasId: 1,
                    avatar: {
                        mediaBasePath: '$avatar.mediaBasePath',
                        mediaUri: '$avatar.mediaUri',
                        mediaType: '$avatar.mediaType',
                        mediaEndpoint: {
                            $concat: ["$concat", "/", "$avatar.mediaID"]
                        },

                    },

                }
            },
            {
                $sort: {
                    createdAt: - 1
                },

            },
        );

        if (startdate != undefined && enddate != undefined) {
            var before = new Date(startdate).toISOString().split("T")[0];
            var input = new Date(enddate);
            input.setDate(input.getDate() + 1);
            var today = new Date(input).toISOString().split("T")[0];
            pipeline.push({
                "$match": {
                    createdAt: {
                        "$gte": before,
                        "$lte": today
                    }
                }
            });
        }
        if (listpriority != undefined) {
            pipeline.push({
                "$match": {
                    priority: {
                        "$in": listpriority
                    }
                }
            });
        }
        if (listgender != undefined) {
            pipeline.push({
                "$match": {
                    gender: {
                        "$in": listgender
                    }
                }
            });
        }
        if (startage != undefined && endage != undefined) {
            pipeline.push({
                "$match": {
                    age: {
                        "$gte": startage,
                        "$lte": endage
                    }
                }
            });
        }
        if (listarea != undefined) {
            const mongoose = require('mongoose');
            var temparea = [];
            listarea.forEach((e) => {
                temparea.push(mongoose.Types.ObjectId(e));
            });
            pipeline.push({
                "$match": {
                    areasId: {
                        "$in": temparea
                    }
                }
            });
        }
        if (searchname != undefined) {
            pipeline.push({
                "$match": {
                    fullName: {
                        "$regex": searchname,
                        "$options": "i"
                    }
                }
            });
        }
        if (page > 0) {
            pipeline.push({
                "$skip": page * limit
            });
        }
        if (limit > 0) {
            pipeline.push({
                "$limit": limit
            });
        }

        var query = await this.userAdsModel.aggregate(pipeline);
        return query;
    }

    //pindahin function dari ads ke userads
    // async getAdsbygender(startdate: string, enddate: string) {
    //     var before = new Date(startdate).toISOString().split("T")[0];
    //     var input = new Date(enddate);
    //     input.setDate(input.getDate() + 1);
    //     var today = new Date(input).toISOString().split("T")[0];

    //     var query = await this.userAdsModel.aggregate([
    //         {
    //             "$match":
    //             {
    //                 createdAt:
    //                 {
    //                     "$gte": before,
    //                     "$lte": today
    //                 },
    //                 "$or":
    //                     [
    //                         {
    //                             "$expr":
    //                             {
    //                                 "$eq":
    //                                     [
    //                                         "$statusClick", true
    //                                     ]
    //                             }
    //                         },
    //                         {
    //                             "$expr":
    //                             {
    //                                 "$eq":
    //                                     [
    //                                         "$statusView", true
    //                                     ]
    //                             }
    //                         },
    //                     ]
    //             }
    //         },
    //         {
    //             "$facet":
    //             {
    //                 "dataclick":
    //                     [
    //                         {
    //                             "$match":
    //                             {
    //                                 "$expr":
    //                                 {
    //                                     "$eq":
    //                                         [
    //                                             "$statusClick", true
    //                                         ]
    //                                 }
    //                             }
    //                         },
    //                         {
    //                             "$project":
    //                             {
    //                                 _id: 1,
    //                                 userID: 1
    //                             }
    //                         }
    //                     ],
    //                 "dataview":
    //                     [
    //                         {
    //                             "$match":
    //                             {
    //                                 "$expr":
    //                                 {
    //                                     "$eq":
    //                                         [
    //                                             "$statusView", true
    //                                         ]
    //                                 }
    //                             }
    //                         },
    //                         {
    //                             "$project":
    //                             {
    //                                 _id: 1,
    //                                 userID: 1
    //                             }
    //                         }
    //                     ],
    //             }
    //         },
    //         {
    //             "$project":
    //             {
    //                 "data":
    //                 {
    //                     "$concatArrays":
    //                         [
    //                             "$dataclick", "$dataview"
    //                         ]
    //                 }
    //             }
    //         },
    //         {
    //             "$unwind":
    //             {
    //                 path: "$data"
    //             }
    //         },
    //         {
    //             "$lookup":
    //             {
    //                 "from": "newUserBasics",
    //                 "as": "recorduser",
    //                 "let": {
    //                     "userbasic_fk": "$data.userID"
    //                 },
    //                 "pipeline":
    //                     [
    //                         {
    //                             "$match":
    //                             {
    //                                 "$expr":
    //                                 {
    //                                     "$eq":
    //                                         [
    //                                             "$_id",
    //                                             "$$userbasic_fk"
    //                                         ]
    //                                 },
    //                             }
    //                         },
    //                         {
    //                             "$project":
    //                             {
    //                                 _id: 1,
    //                                 email: 1,
    //                                 gender: {
    //                                     $switch: {
    //                                         branches: [
    //                                             {
    //                                                 case: {
    //                                                     $eq: ['$gender', 'FEMALE']
    //                                                 },
    //                                                 then: 'FEMALE',

    //                                             },
    //                                             {
    //                                                 case: {
    //                                                     $eq: ['$gender', ' FEMALE']
    //                                                 },
    //                                                 then: 'FEMALE',

    //                                             },
    //                                             {
    //                                                 case: {
    //                                                     $eq: ['$gender', 'Perempuan']
    //                                                 },
    //                                                 then: 'FEMALE',

    //                                             },
    //                                             {
    //                                                 case: {
    //                                                     $eq: ['$gender', 'Wanita']
    //                                                 },
    //                                                 then: 'FEMALE',

    //                                             },
    //                                             {
    //                                                 case: {
    //                                                     $eq: ['$gender', 'MALE']
    //                                                 },
    //                                                 then: 'MALE',

    //                                             },
    //                                             {
    //                                                 case: {
    //                                                     $eq: ['$gender', ' MALE']
    //                                                 },
    //                                                 then: 'MALE',

    //                                             },
    //                                             {
    //                                                 case: {
    //                                                     $eq: ['$gender', 'Laki-laki']
    //                                                 },
    //                                                 then: 'MALE',

    //                                             },
    //                                             {
    //                                                 case: {
    //                                                     $eq: ['$gender', 'Pria']
    //                                                 },
    //                                                 then: 'MALE',

    //                                             },

    //                                         ],
    //                                         default: "OTHER",
    //                                     },

    //                                 },
    //                                 lokasi: "$states"
    //                             }
    //                         },
    //                     ]
    //             }
    //         },
    //         {
    //             "$project":
    //             {
    //                 _id: 1,
    //                 gender:
    //                 {
    //                     "$arrayElemAt":
    //                         [
    //                             "$recorduser.gender", 0
    //                         ]
    //                 },
    //                 lokasi:
    //                 {
    //                     "$arrayElemAt":
    //                         [
    //                             "$recorduser.lokasi", 0
    //                         ]
    //                 }
    //             }
    //         },
    //         {
    //             "$facet":
    //             {
    //                 "gender":
    //                     [
    //                         {
    //                             "$group":
    //                             {
    //                                 _id: "$gender",
    //                                 total:
    //                                 {
    //                                     "$sum": 1
    //                                 }
    //                             }
    //                         },
    //                     ],
    //                 "area":
    //                     [
    //                         {
    //                             "$group":
    //                             {
    //                                 _id: "$lokasi",
    //                                 total:
    //                                 {
    //                                     "$sum": 1
    //                                 }
    //                             }
    //                         },
    //                         {
    //                             "$group":
    //                             {
    //                                 _id: null,
    //                                 totaldata:
    //                                 {
    //                                     "$sum": "$total"
    //                                 },
    //                                 data:
    //                                 {
    //                                     "$push":
    //                                     {
    //                                         _id: "$_id",
    //                                         total: "$total"
    //                                     }
    //                                 }
    //                             }
    //                         },
    //                         {
    //                             "$unwind":
    //                             {
    //                                 path: "$data"
    //                             }
    //                         },
    //                         {
    //                             "$project":
    //                             {
    //                                 _id: "$data._id",
    //                                 total: "$data.total",
    //                                 persentase:
    //                                 {
    //                                     "$multiply":
    //                                         [
    //                                             {
    //                                                 "$divide":
    //                                                     [
    //                                                         "$data.total", "$totaldata"
    //                                                     ]
    //                                             }, 100
    //                                         ]
    //                                 }
    //                             }
    //                         },
    //                         {
    //                             "$group":
    //                             {
    //                                 _id: "$_id",
    //                                 persentase:
    //                                 {
    //                                     "$first": "$persentase"
    //                                 },
    //                                 total:
    //                                 {
    //                                     "$first": "$total"
    //                                 },
    //                             }
    //                         },
    //                         {
    //                             "$lookup":
    //                             {
    //                                 "from": "areas",
    //                                 "as": "areas_data",
    //                                 "let":
    //                                 {
    //                                     "areas_fk": "$_id.$id"
    //                                 },
    //                                 "pipeline":
    //                                     [
    //                                         {
    //                                             "$match":
    //                                             {
    //                                                 "$expr":
    //                                                 {
    //                                                     "$eq":
    //                                                         [
    //                                                             "$_id", "$$areas_fk"
    //                                                         ]
    //                                                 }
    //                                             }
    //                                         }
    //                                     ]
    //                             }
    //                         },
    //                         {
    //                             "$project":
    //                             {
    //                                 _id:
    //                                 {
    //                                     "$ifNull":
    //                                         [
    //                                             {
    //                                                 "$arrayElemAt":
    //                                                     [
    //                                                         "$areas_data.stateName", 0
    //                                                     ]
    //                                             },
    //                                             "Lainnya"
    //                                         ]
    //                                 },
    //                                 persentase: 1,
    //                                 // total:1
    //                             }
    //                         },
    //                         {
    //                             "$sort":
    //                             {
    //                                 _id: 1
    //                             }
    //                         }
    //                     ]
    //             }
    //         }
    //     ]);

    //     return query;
    // }

    async getAdsbygender(startdate: string, enddate: string) {
        var before = new Date(startdate).toISOString().split("T")[0];
        var input = new Date(enddate);
        input.setDate(input.getDate() + 1);
        var today = new Date(input).toISOString().split("T")[0];

        var query = await this.userAdsModel.aggregate([
            {
                "$facet":
                {
                    "view":
                    [
                        {
                            "$unwind":
                            {
                                path:"$updateAt",
                                preserveNullAndEmptyArrays:true
                            }
                        },
                        {
                            "$project":
                            {
                                _id:1,
                                userID:1,
                                adsID:1,
                                statusView:
                                {
                                    "$cond": 
                                    {
                                        if: {
                                            $eq: ["$statusClick", true]
                                        },
                                        then: true,
                                        else: '$statusView'
                                    }
                                },
                                statusClick:1,
                                createdAt:1,
                                updateAt:
                                {
                                    "$ifNull":
                                    [
                                        "$updateAt",
                                        "$createdAt"
                                    ]
                                },
                            }
                        },
                        {
                            "$match":
                            {
                                "$and":
                                [
                                    {
                                        statusView:true
                                    },
                                    {
                                        updateAt:
                                        {
                                            "$gte": before,
                                            "$lte": today
                                        },
                                    }
                                ]
                            }
                        },
                        {
                            "$project":
                            {
                                _id:0,
                                userID:1,
                                // type:"view"
                            }
                        },
                    ],
                    "click":
                    [
                        {
                            "$unwind":
                            {
                                path:"$clickTime",
                                preserveNullAndEmptyArrays:true
                            }
                        },
                        {
                            "$project":
                            {
                                _id:1,
                                userID:1,
                                adsID:1,
                                createdAt:1,
                                clickAt:
                                {
                                    "$switch":
                                    {
                                        branches:
                                        [
                                            {
                                                case:
                                                {
                                                    "$ne":
                                                    [
                                                        "$clickTime", null
                                                    ]
                                                },
                                                then:"$clickTime"
                                            },
                                            {
                                                case:
                                                {
                                                    "$ne":
                                                    [
                                                        "$clickAt", null
                                                    ]
                                                },
                                                then:"$clickAt"
                                            },
                                        ],
                                        default:"$createdAt"
                                    }
                                },
                                statusClick:1,
                                clickTime:
                                {
                                    "$switch":
                                    {
                                        branches:
                                        [
                                            {
                                                case:
                                                {
                                                    "$ne":
                                                    [
                                                        "$clickTime", null
                                                    ]
                                                },
                                                then:"$clickTime"
                                            },
                                            {
                                                case:
                                                {
                                                    "$ne":
                                                    [
                                                        "$clickAt", null
                                                    ]
                                                },
                                                then:"$clickAt"
                                            },
                                        ],
                                        default:"$createdAt"
                                    }
                                },
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
                                                "$statusClick", true
                                            ]
                                        }
                                    },
                                    {
                                        clickTime:
                                        {
                                            "$gte": before,
                                            "$lte": today
                                        },
                                    }
                                ]
                            }
                        },
                        {
                            "$project":
                            {
                                _id:0,
                                userID:1,
                                // type:"click"
                            }
                        },
                    ]
                }
            },
            {
                "$project":
                {
                    data:
                    {
                        "$concatArrays":
                        [
                            "$view", "$click"
                        ]
                    }
                }
            },
            {
                "$unwind":
                {
                    path:"$data"
                }
            },
            {
                "$project":
                {
                    userID:"$data.userID"
                }
            },
            {
                "$lookup":
                {
                    from:"newUserBasics",
                    let:
                    {
                        basic_fk:"$userID"
                    },
                    as:"basic_data",
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
                            "$project":
                            {
                                _id:1,
                                email:1,
                                gender: {
                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',
                                                
                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',
                                                
                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',
                                                
                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',
                                                
                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',
                                                
                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',
                                                
                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',
                                                
                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',
                                                
                                            },
                                            
                                        ],
                                        default: "OTHER",    
                                    },
                                              
                                },
                                lokasi:"$states"
                            }
                        },
                    ]
                }
            },
            {
                "$project":
                {
                    _id:1,
                    gender:
                    {
                        "$arrayElemAt":
                        [
                            "$basic_data.gender", 0
                        ]
                    },
                    lokasi:
                    {
                        "$arrayElemAt":
                        [
                            "$basic_data.lokasi", 0
                        ]
                    }
                }
            },
            {
                "$facet":
                {
                    "gender":
                    [
                        {
                            "$group":
                            {
                                _id:"$gender",
                                total:
                                {
                                    "$sum":1
                                }
                            }
                        },
                    ],
                    "area":
                    [
                        {
                            "$group":
                            {
                                _id:"$lokasi",
                                total:
                                {
                                    "$sum":1
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
                                path:"$data"
                            }
                        },
                        {
                            "$project":
                            {
                                _id: "$data._id",
                                total:"$data.total",
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
                                },
                                total:
                                {
                                    "$first": "$total"
                                },
                            }
                        },
                        {
                            "$lookup":
                            {
                                "from": "areas",
                                "as": "areas_data",
                                "let": 
                                {
                                    "areas_fk": "$_id.$id"
                                },
                                "pipeline": 
                                [
                                    {
                                        "$match":
                                        {
                                            "$expr":
                                            {
                                                "$eq":
                                                [
                                                    "$_id", "$$areas_fk" 
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
                                _id:
                                {
                                    "$ifNull":
                                    [
                                        {
                                            "$arrayElemAt":
                                            [
                                                "$areas_data.stateName", 0
                                            ]
                                        },
                                        "Lainnya"
                                    ]
                                },
                                persentase:1,
                                total:1
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
            }
        ]);

        return query;
    }

    async listpenontondetail(idads: string, statusClick: any, statusView: any, limit: number, page: number) {
        var pipeline = [];
        pipeline.push(
            {
                $match: {
                    "adsID": new Types.ObjectId(idads)

                }
            },
            {
                "$unwind":
                {
                    path: "$updateAt",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    "adsID": 1,
                    "createdAt": '$updateAt',
                    "description": 1,
                    "priority": 1,
                    "priorityNumber": 1,
                    "statusClick": 1,
                    "statusView": 1,
                    "userID": 1,
                    "liveAt": 1,
                    "viewed": 1,
                    "liveTypeuserads": 1,
                    "adstypesId": 1,
                    "isActive": 1,
                    "updateAt": 1,
                    "clickAt": 1,
                    "timeViewSecond": 1
                }
            },
            {
                $match: {
                    "viewed": { "$ne": 0 }

                }
            },
            {
                $lookup: {
                    from: 'userbasics',
                    localField: 'userID',
                    foreignField: '_id',
                    as: 'userbasics_data',

                },

            },
            {
                $lookup: {
                    from: 'areas',
                    localField: 'userbasics_data.states.$id',
                    foreignField: '_id',
                    as: 'areas_data',

                },

            },
            {
                $lookup: {
                    from: 'ads',
                    localField: 'adsID',
                    foreignField: '_id',
                    as: 'adsdata',

                },

            },
            {
                $set: {
                    age: {
                        $cond: {
                            if: {
                                $and: [{
                                    $arrayElemAt: ["$userbasics_data.dob", 0]
                                }, {
                                    $ne: [{
                                        $arrayElemAt: ["$userbasics_data.dob", 0]
                                    }, ""]
                                }]
                            },
                            then: {
                                $toInt: {
                                    $divide: [{
                                        $subtract: [new Date(), {
                                            $toDate: {
                                                $arrayElemAt: ["$userbasics_data.dob", 0]
                                            }
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
                $project: {
                    user: {
                        $arrayElemAt: ['$userbasics_data', 0]
                    },
                    areas:
                    {
                        $cond: {
                            if: {
                                $eq: ['$areas_data', []]
                            },
                            then: "OTHER",
                            else: {
                                $arrayElemAt: ["$areas_data.stateName", 0]
                            },

                        }
                    },
                    areasId:
                    {
                        $cond: {
                            if: {
                                $eq: ['$areas_data', []]
                            },
                            then: "",
                            else: {
                                $arrayElemAt: ["$areas_data._id", 0]
                            },

                        }
                    },
                    adsID: 1,
                    age: 1,
                    clickAt: 1,
                    createdAt: 1,
                    description: 1,
                    priority: 1,
                    statusClick: 1,
                    statusView: 1,
                    updatedAt: 1,
                    viewAt: 1,
                    viewed: 1,
                    name: {
                        $arrayElemAt: ['$adsdata.name', 0]
                    },
                    typeid: {
                        $arrayElemAt: ['$adsdata.typeAdsID', 0]
                    },

                }
            },
            {
                $lookup: {
                    from: 'adstypes',
                    localField: 'typeid',
                    foreignField: '_id',
                    as: 'typeads',

                },

            },
            {
                $project: {

                    profilpictid: '$user.profilePict.$id',
                    fullName: '$user.fullName',
                    clickAt: 1,
                    createdAt: 1,
                    description: 1,
                    priority: 1,
                    statusClick: 1,
                    statusView: {
                        $cond: {
                            if: {
                                $eq: ["$statusClick", true]
                            },
                            then: true,
                            else: '$statusView'
                        }
                    },
                    updatedAt: 1,
                    viewAt: 1,
                    viewed: 1,
                    name: 1,
                    adsID: 1,
                    age: 1,
                    areas: 1,
                    areasId: 1,
                    gender: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: ['$user.gender', 'FEMALE']
                                    },
                                    then: 'FEMALE',

                                },
                                {
                                    case: {
                                        $eq: ['$user.gender', ' FEMALE']
                                    },
                                    then: 'FEMALE',

                                },
                                {
                                    case: {
                                        $eq: ['$user.gender', 'Perempuan']
                                    },
                                    then: 'FEMALE',

                                },
                                {
                                    case: {
                                        $eq: ['$user.gender', 'Wanita']
                                    },
                                    then: 'FEMALE',

                                },
                                {
                                    case: {
                                        $eq: ['$user.gender', 'MALE']
                                    },
                                    then: 'MALE',

                                },
                                {
                                    case: {
                                        $eq: ['$user.gender', ' MALE']
                                    },
                                    then: 'MALE',

                                },
                                {
                                    case: {
                                        $eq: ['$user.gender', 'Laki-laki']
                                    },
                                    then: 'MALE',

                                },
                                {
                                    case: {
                                        $eq: ['$user.gender', 'Pria']
                                    },
                                    then: 'MALE',

                                },

                            ],
                            default: "OTHER",

                        },

                    },
                    typeads: {
                        $arrayElemAt: ['$typeads.nameType', 0]
                    },
                    valueType: {
                        $arrayElemAt: ['$typeads.creditValue', 0]
                    },

                }
            },
            {
                $lookup: {
                    from: 'mediaprofilepicts',
                    localField: 'profilpictid',
                    foreignField: '_id',
                    as: 'profilePict_data',

                },

            },
            {
                $project: {
                    profilpict: {
                        $arrayElemAt: ['$profilePict_data', 0]
                    },
                    gender: 1,
                    fullName: 1,
                    clickAt: 1,
                    createdAt: 1,
                    description: 1,
                    priority: 1,
                    statusClick: 1,
                    statusView: 1,
                    updatedAt: 1,
                    viewAt: 1,
                    viewed: 1,
                    name: 1,
                    typeads: 1,
                    valueType: 1,
                    adsID: 1,
                    age: 1,
                    areas: 1,
                    areasId: 1,
                    avatar: {
                        mediaBasePath: '$profilpict.mediaBasePath',
                        mediaID: '$profilpict.mediaID',
                        mediaUri: '$profilpict.mediaUri',
                        mediaType: '$profilpict.mediaType',
                        mediaEndpoint: '$profilpict.fsTargetUri',
                        medreplace: {
                            $replaceOne: {
                                input: "$profilpict.mediaUri",
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
                            input: "$profilpict.mediaUri",
                            find: "_0001.jpeg",
                            replacement: ""
                        }
                    },

                },

            },
            {
                $project: {
                    fullName: 1,
                    clickAt: 1,
                    createdAt: 1,
                    description: 1,
                    priority: 1,
                    statusClick: 1,
                    statusView: 1,
                    updatedAt: 1,
                    viewAt: 1,
                    viewed: 1,
                    name: 1,
                    adsID: 1,
                    age: 1,
                    gender: 1,
                    typeads: 1,
                    valueType: 1,
                    concat: '$concat',
                    pict: '$pict',
                    areas: 1,
                    areasId: 1,
                    avatar: {
                        mediaBasePath: '$profilpict.mediaBasePath',
                        mediaUri: '$profilpict.mediaUri',
                        mediaID: '$profilpict.mediaID',
                        mediaType: '$profilpict.mediaType',
                        mediaEndpoint: '$profilpict.fsTargetUri',
                        medreplace: {
                            $replaceOne: {
                                input: "$profilpict.mediaUri",
                                find: "_0001.jpeg",
                                replacement: ""
                            }
                        },

                    },

                }
            },
            {
                $project: {
                    fullName: 1,
                    clickAt: 1,
                    createdAt: 1,
                    description: 1,
                    priority: 1,
                    statusClick: 1,
                    statusView: 1,
                    updatedAt: 1,
                    viewAt: 1,
                    viewed: 1,
                    name: 1,
                    gender: 1,
                    typeads: 1,
                    valueType: 1,
                    adsID: 1,
                    age: 1,
                    areas: 1,
                    areasId: 1,
                    avatar: {
                        mediaBasePath: '$avatar.mediaBasePath',
                        mediaUri: '$avatar.mediaUri',
                        mediaType: '$avatar.mediaType',
                        mediaEndpoint: {
                            $concat: ["$concat", "/", "$avatar.mediaID"]
                        },

                    },

                }
            },
            {
                $sort: {
                    createdAt: - 1
                },

            },
        );

        if (statusClick != undefined && statusClick == true) {
            pipeline.push({
                "$match": {
                    statusClick: statusClick
                }
            });
        }
        if (statusView != undefined && statusView == true) {
            pipeline.push({
                "$match": {
                    statusView: statusView
                }
            });
        }
        if (page > 0) {
            pipeline.push({
                "$skip": page * limit
            });
        }
        if (limit > 0) {
            pipeline.push({
                "$limit": limit
            });
        }

        //console.log(JSON.stringify(pipeline));

        var query = await this.userAdsModel.aggregate(pipeline);
        return query;
    }

    async listpenontondetail2(idads: string, statusClick: any, statusView: any, startdate:string, enddate:string, limit: number, page: number) {
        var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));
    
        var dateend = currentdate.toISOString().split("T")[0];
        
        var pipeline = [];
        pipeline.push(
            {
                $match: {
                    "adsID": new Types.ObjectId(idads)
                }
            },
        );
        
        if (statusClick != undefined && statusClick == true) 
        {
            pipeline.push({
                "$unwind":
                {
                    path: "$clickTime",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    "adsID": 1,
                    "createdAt": 1,
                    "description": 1,
                    "priority": 1,
                    "priorityNumber": 1,
                    "statusClick": 1,
                    "statusView": 1,
                    "userID": 1,
                    "liveAt": 1,
                    "viewed": 1,
                    "liveTypeuserads": 1,
                    "adstypesId": 1,
                    "isActive": 1,
                    "updateAt": 1,
                    "clickAt": 
                    {
                        "$switch":
                        {
                            branches:
                            [
                                {
                                    case:
                                    {
                                        "$ne":
                                        [
                                            "$clickTime", null
                                        ]
                                    },
                                    then:"$clickTime"
                                },
                                {
                                    case:
                                    {
                                        "$ne":
                                        [
                                            "$clickAt", null
                                        ]
                                    },
                                    then:"$clickAt"
                                },
                            ],
                            default:"$createdAt"
                        }
                    },
                    "clickTime":
                    {
                        "$switch":
                        {
                            branches:
                            [
                                {
                                    case:
                                    {
                                        "$ne":
                                        [
                                            "$clickTime", null
                                        ]
                                    },
                                    then:"$clickTime"
                                },
                                {
                                    case:
                                    {
                                        "$ne":
                                        [
                                            "$clickAt", null
                                        ]
                                    },
                                    then:"$clickAt"
                                },
                            ],
                            default:"$createdAt"
                        }
                    },
                    "timeViewSecond": 1
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
                                    "$statusView", true
                                ]
                            }
                        },
                        {
                            "clickTime":
                            {
                                "$gte":startdate,
                                "$lte":dateend
                            }
                        }
                    ]
                }
            },);
        }
        else if(statusView != undefined && statusView == true)
        {
            pipeline.push({
                "$unwind":
                {
                    path: "$updateAt",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    "adsID": 1,
                    "createdAt": 1,
                    "description": 1,
                    "priority": 1,
                    "priorityNumber": 1,
                    "statusClick": 1,
                    "statusView": 
                    {
                        "$cond": 
                        {
                            if: 
                            {
                                $eq: ["$statusClick", true]
                            },
                            then: true,
                            else: '$statusView'
                        }
                    },
                    "userID": 1,
                    "liveAt": 1,
                    "viewed": 1,
                    "liveTypeuserads": 1,
                    "adstypesId": 1,
                    "isActive": 1,
                    "updateAt": 
                    {
                        "$ifNull":
                        [
                            "$updateAt",
                            "$createdAt"
                        ]
                    },
                    "clickAt": 1,
                    "timeViewSecond": 1
                },
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
                                    "$statusView", true
                                ]
                            }
                        },
                        {
                            "updateAt":
                            {
                                "$gte":startdate,
                                "$lte":dateend
                            }
                        }
                    ]
                }
            },);
        }

        pipeline.push(
            {
                $match: 
                {
                    "viewed": { "$ne": 0 }
                }
            },
            {
                $lookup: {
                    from: 'userbasics',
                    localField: 'userID',
                    foreignField: '_id',
                    as: 'userbasics_data',
                },

            },
            {
                $lookup: {
                    from: 'areas',
                    localField: 'userbasics_data.states.$id',
                    foreignField: '_id',
                    as: 'areas_data',

                },

            },
            {
                $lookup: {
                    from: 'ads',
                    localField: 'adsID',
                    foreignField: '_id',
                    as: 'adsdata',

                },

            },
            {
                $project: {
                    user: {
                        $arrayElemAt: ['$userbasics_data', 0]
                    },
                    areas:
                    {
                        $cond: {
                            if: {
                                $eq: ['$areas_data', []]
                            },
                            then: "OTHER",
                            else: {
                                $arrayElemAt: ["$areas_data.stateName", 0]
                            },

                        }
                    },
                    areasId:
                    {
                        $cond: {
                            if: {
                                $eq: ['$areas_data', []]
                            },
                            then: "",
                            else: {
                                $arrayElemAt: ["$areas_data._id", 0]
                            },

                        }
                    },
                    adsID: 1,
                    clickAt: 1,
                    createdAt: 1,
                    description: 1,
                    priority: 1,
                    statusClick: 1,
                    statusView: 1,
                    updateAt: 1,
                    clickTime:1,
                    viewAt: 1,
                    viewed: 1,
                    name: {
                        $arrayElemAt: ['$adsdata.name', 0]
                    },
                    typeid: {
                        $arrayElemAt: ['$adsdata.typeAdsID', 0]
                    },

                }
            },
            {
                $lookup: {
                    from: 'adstypes',
                    localField: 'typeid',
                    foreignField: '_id',
                    as: 'typeads',

                },
            },
            {
                $project: {
                    profilpictid: '$user.profilePict.$id',
                    fullName: '$user.fullName',
                    clickAt: 1,
                    createdAt: 1,
                    description: 1,
                    priority: 1,
                    statusClick: 1,
                    statusView: 
                    {
                        $cond: {
                            if: {
                                $eq: ["$statusClick", true]
                            },
                            then: true,
                            else: '$statusView'
                        }
                    },
                    updateAt: 1,
                    clickTime:1,
                    viewAt: 1,
                    viewed: 1,
                    name: 1,
                    adsID: 1,
                    areas: 1,
                    areasId: 1,
                    typeads: {
                        $arrayElemAt: ['$typeads.nameType', 0]
                    },
                    valueType: {
                        $arrayElemAt: ['$typeads.creditValue', 0]
                    },

                }
            },
            {
                $lookup: {
                    from: 'mediaprofilepicts',
                    localField: 'profilpictid',
                    foreignField: '_id',
                    as: 'profilePict_data',

                },

            },
            {
                $project: {
                    profilpict: {
                        $arrayElemAt: ['$profilePict_data', 0]
                    },
                    fullName: 1,
                    clickAt: 1,
                    createdAt: 1,
                    description: 1,
                    priority: 1,
                    statusClick: 1,
                    statusView: 1,
                    updateAt: 1,
                    clickTime:1,
                    viewAt: 1,
                    viewed: 1,
                    name: 1,
                    typeads: 1,
                    valueType: 1,
                    adsID: 1,
                    areas: 1,
                    areasId: 1,
                    avatar: {
                        mediaBasePath: '$profilpict.mediaBasePath',
                        mediaID: '$profilpict.mediaID',
                        mediaUri: '$profilpict.mediaUri',
                        mediaType: '$profilpict.mediaType',
                        mediaEndpoint: '$profilpict.fsTargetUri',
                        medreplace: {
                            $replaceOne: {
                                input: "$profilpict.mediaUri",
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
                            input: "$profilpict.mediaUri",
                            find: "_0001.jpeg",
                            replacement: ""
                        }
                    },

                },

            },
            {
                $project: {
                    fullName: 1,
                    clickAt: 1,
                    createdAt: 1,
                    description: 1,
                    priority: 1,
                    statusClick: 1,
                    statusView: 1,
                    updateAt: 1,
                    clickTime:1,
                    viewAt: 1,
                    viewed: 1,
                    name: 1,
                    adsID: 1,
                    typeads: 1,
                    valueType: 1,
                    concat: '$concat',
                    pict: '$pict',
                    areas: 1,
                    areasId: 1,
                    avatar: {
                        mediaBasePath: '$profilpict.mediaBasePath',
                        mediaUri: '$profilpict.mediaUri',
                        mediaID: '$profilpict.mediaID',
                        mediaType: '$profilpict.mediaType',
                        mediaEndpoint: '$profilpict.fsTargetUri',
                        medreplace: {
                            $replaceOne: {
                                input: "$profilpict.mediaUri",
                                find: "_0001.jpeg",
                                replacement: ""
                            }
                        },

                    },

                }
            },
            {
                $project: {
                    fullName: 1,
                    clickAt: 1,
                    createdAt: 1,
                    description: 1,
                    priority: 1,
                    statusClick: 1,
                    statusView: 1,
                    updateAt: 1,
                    clickTime:1,
                    viewAt: 1,
                    viewed: 1,
                    name: 1,
                    typeads: 1,
                    valueType: 1,
                    adsID: 1,
                    areas: 1,
                    areasId: 1,
                    avatar: {
                        mediaBasePath: '$avatar.mediaBasePath',
                        mediaUri: '$avatar.mediaUri',
                        mediaType: '$avatar.mediaType',
                        mediaEndpoint: {
                            $concat: ["$concat", "/", "$avatar.mediaID"]
                        },

                    },

                }
            },
        );

        if (statusClick != undefined && statusClick == true) 
        {
            pipeline.push(
                {
                    $sort: 
                    {
                        clickTime: - 1
                    },
                },
            );
        }
        else if(statusView != undefined && statusView == true)
        {
            pipeline.push(
                {
                    $sort: 
                    {
                        updateAt: - 1
                    },
                },
            );
        }

        if (page > 0) {
            pipeline.push({
                "$skip": page * limit
            });
        }
        if (limit > 0) {
            pipeline.push({
                "$limit": limit
            });
        }

        // console.log(JSON.stringify(pipeline));

        var query = await this.userAdsModel.aggregate(pipeline);
        return query;
    }

    async campaignDashboard(userId: string,start_date: any, end_date: any){
        var pipelineMatch = [];
        if (start_date != null && end_date != null) {
            var andExpr = [];
            andExpr.push({ $gte: ["$timestamp", start_date] });
            andExpr.push({ $lte: ["$timestamp", end_date] });
            if (userId != undefined) {
                andExpr.push({ $eq: [ "$userID", new mongoose.Types.ObjectId(userId) ] });
            }
            pipelineMatch.push({
                $match:
                {
                    $expr: {
                        $and: andExpr
                    }
                },
            })
        }
        pipelineMatch.push(
        {
            $project:{
                status: {
                    $switch: {
                        branches: [
                            {
                                case: { $eq: ['$status', 'DRAFT'] },
                                then: 'DRAFT',
                            },
                            {
                                case: { $or: [{ $eq: ['$status', 'FINISH'] }, { $eq: ['$status', 'IN_ACTIVE'] }, { $eq: ['$status', 'REPORTED'] }] },
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
                }
            }
        },
        {
            $facet:
            {
                status: [
                    {
                        $group: {
                            _id: "$status",
                            status: { $first: '$status' },
                            count: { $sum: 1 }
                        }
                    }
                ],
            }
        });

        //------------FACET VIEWED------------
        var viewedFacet = [];
        if (start_date != undefined && end_date != undefined) {
            viewedFacet.push({
                $match: {
                    updateAt: {
                        $elemMatch: {
                            $gte: await this.utilsService.formatDateString(start_date),
                            $lte: await this.utilsService.formatDateString(end_date)
                        }
                    }
                }
            });
        }
        viewedFacet.push({
            $unwind:
            {
                path: "$updateAt",
                includeArrayIndex: 'updateAt_index',
            }
        });
        if (start_date != undefined && end_date != undefined) {
            viewedFacet.push({
                $match: {
                    updateAt: {
                        $gte: await this.utilsService.formatDateString(start_date),
                        $lte: await this.utilsService.formatDateString(end_date)
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

        //------------FACET REACH------------
        var reachFacet = [];
        if (start_date != undefined && end_date != undefined) {
            reachFacet.push({
                $match: {
                    updateAt: {
                        $elemMatch: {
                            $gte: await this.utilsService.formatDateString(start_date),
                            $lte: await this.utilsService.formatDateString(end_date)
                        }
                    }
                }
            });
        }
        reachFacet.push({
            $unwind:
            {
                path: "$updateAt",
                includeArrayIndex: 'updateAt_index',
            }
        });
        if (start_date != undefined && end_date != undefined) {
            reachFacet.push({
                $match: {
                    updateAt: {
                        $gte: await this.utilsService.formatDateString(start_date),
                        $lte: await this.utilsService.formatDateString(end_date)
                    }
                }
            });
        }
        reachFacet.push({
            $project: {
                userID: 1,
                viewTime: {
                    $substr:
                        [
                            "$updateAt", 0, 10
                        ]
                }
            }
        },
            {
                $group: {
                    _id: {
                        "viewTime": "$viewTime",
                        "userID": "$userID"
                    },
                    "userIDCount": { "$sum": 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.viewTime",
                    viewTime: {
                        $push: {
                            "userID": "$_id.userID",
                            "count": "$userIDCount"
                        },
                    },
                    count: { "$sum": "$userIDCount" }
                }
            },
            {
                $project: {
                    _id: "$_id",
                    reachView: { $size: "$viewTime" }
                }
            }
        );

        //------------FACET IMPRESI------------
        var impresiFacet = [];
        if (start_date != undefined && end_date != undefined) {
            impresiFacet.push({
                $match: {
                    updateAt: {
                        $elemMatch: {
                            $gte: await this.utilsService.formatDateString(start_date),
                            $lte: await this.utilsService.formatDateString(end_date)
                        }
                    }
                }
            },);
        }
        impresiFacet.push({
            $unwind:
            {
                path: "$updateAt",
                includeArrayIndex: 'updateAt_index',
            }
        });
        if (start_date != undefined && end_date != undefined) {
            impresiFacet.push({
                $match: {
                    updateAt: {
                        $gte: await this.utilsService.formatDateString(start_date),
                        $lte: await this.utilsService.formatDateString(end_date)
                    }
                }
            });
        }
        impresiFacet.push({
            $project: {
                viewTime: {
                    $substr:
                        [
                            "$updateAt", 0, 10
                        ]
                }
            }
        },
        {
            $group:
            {
                _id: "$viewTime",
                impresiView:
                {
                    "$sum": 1
                }
            }
            });

        //------------FACET CTA------------
        var CTAFacet = [];
        if (start_date != undefined && end_date != undefined) {
            CTAFacet.push({
                $match: {
                    clickTime: {
                        $elemMatch: {
                            $gte: await this.utilsService.formatDateString(start_date),
                            $lte: await this.utilsService.formatDateString(end_date)
                        }
                    }
                }
            });
        }
        CTAFacet.push({
            $unwind:
            {
                path: "$clickTime",
                includeArrayIndex: 'clickTime_index',
            }
        });
        if (start_date != undefined && end_date != undefined) {
            CTAFacet.push({
                $match: {
                    clickTime: {
                        $gte: await this.utilsService.formatDateString(start_date),
                        $lte: await this.utilsService.formatDateString(end_date)
                    }
                }
            });
        }
        CTAFacet.push({
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
            });

        //------------FACET CTA COUNT------------
        var CTACountFacet = [];
        if (start_date != undefined && end_date != undefined) {
            CTACountFacet.push({
                $match: {
                    clickTime: {
                        $elemMatch: {
                            $gte: await this.utilsService.formatDateString(start_date),
                            $lte: await this.utilsService.formatDateString(end_date)
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
                        $gte: await this.utilsService.formatDateString(start_date),
                        $lte: await this.utilsService.formatDateString(end_date)
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

        //------------FACET VIEWTIME------------
        var viewTimeFacet = [];
        if (start_date != undefined && end_date != undefined) {
            viewTimeFacet.push({
                $match: {
                    updateAt: {
                        $elemMatch: {
                            $gte: await this.utilsService.formatDateString(start_date),
                            $lte: await this.utilsService.formatDateString(end_date)
                        }
                    }
                }
            });
        }
        viewTimeFacet.push(
            {
                $lookup:
                {
                    from: "ads",
                    as: "adsTable",
                    let:
                    {
                        type_fk: "$adsID"
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
                                $lookup: {
                                    from: "adstypes",
                                    localField: "typeAdsID",
                                    foreignField: "_id",
                                    as: "adstypes_data"
                                }
                            },
                            {
                                $project:
                                {
                                    CPV:1,
                                    CPV_adstypes: {
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$adstypes_data", 0] },
                                            },
                                            "in": "$$tmp.CPV"
                                        }
                                    },
                                }
                            }
                        ]
                }
            }, 
            {
            $unwind:
            {
                    path: "$updateAt",
                    includeArrayIndex: 'updateAt_index',
            }
        });
        if (start_date != undefined && end_date != undefined) {
            viewTimeFacet.push({
                $match: {
                    updateAt: {
                        $gte: await this.utilsService.formatDateString(start_date),
                        $lte: await this.utilsService.formatDateString(end_date)
                    }
                }
            });
        }
        viewTimeFacet.push(
            {
                $project: {
                    CPV: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adsTable", 0] },
                            },
                            "in": "$$tmp.CPV"
                        }
                    },
                }
            },
            {
                $group: {
                    _id: null,
                    row: { $sum: 1 },
                    count: { $sum: "$CPV" }
                }
            });

        //------------FACET CLICKTIME------------
        var clickTimeFacet = [];
        if (start_date != undefined && end_date != undefined) {
            clickTimeFacet.push({
                $match: {
                    clickTime: {
                        $elemMatch: {
                            $gte: await this.utilsService.formatDateString(start_date),
                            $lte: await this.utilsService.formatDateString(end_date)
                        }
                    }
                }
            });
        }
        clickTimeFacet.push(
            {
                $lookup:
                {
                    from: "ads",
                    as: "adsTable",
                    let:
                    {
                        type_fk: "$adsID"
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
                                $lookup: {
                                    from: "adstypes",
                                    localField: "typeAdsID",
                                    foreignField: "_id",
                                    as: "adstypes_data"
                                }
                            },
                            {
                                $project:
                                {
                                    CPA: 1,
                                    CPA_adstypes: {
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$adstypes_data", 0] },
                                            },
                                            "in": "$$tmp.CPA"
                                        }
                                    },
                                }
                            }
                        ]
                }
            },
            {
                $unwind:
                {
                    path: "$clickTime",
                    includeArrayIndex: 'clickTime_index',
                }
            });
        if (start_date != undefined && end_date != undefined) {
            clickTimeFacet.push({
                $match: {
                    clickTime: {
                        $gte: await this.utilsService.formatDateString(start_date),
                        $lte: await this.utilsService.formatDateString(end_date)
                    }
                }
            });
        }
        clickTimeFacet.push(
            {
                $project: {
                    CPA: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adsTable", 0] },
                            },
                            "in": "$$tmp.CPA"
                        }
                    },
                }
            },
            {
                $group: {
                    _id: null,
                    row: { $sum: 1 },
                    count: { $sum: "$CPA" }
                }
            });
        var aggregateData = [];
        // aggregateData.push(
        //     {
        //         $addFields: {
        //             dateStart: start_date,
        //             dateEnd: end_date
        //         }
        //     },
        //     {
        //         $lookup:
        //         {
        //             from: "ads",
        //             as: "ads_data",
        //             let:
        //             {
        //                 dateStart_: "$dateStart",
        //                 dateEnd_: "$dateEnd"
        //             },
        //             pipeline: pipelineMatch
        //         }
        //     },);
        // if (userId != undefined) {
        //     aggregateData.push({
        //         $lookup:
        //         {
        //             from: "ads",
        //             as: "adsUSer",
        //             let:
        //             {
        //                 adsID: '$adsID',
        //             },
        //             pipeline: [
        //                 {
        //                     $match: {
        //                         $expr: { $eq: ['$_id', '$$adsID'] }
        //                     }
        //                 },
        //             ]
        //         }
        //     },
        //         {
        //             $addFields: {
        //                 userIdCreate: {
        //                     "$let": {
        //                         "vars": {
        //                             "tmp": { "$arrayElemAt": ["$adsUSer", 0] },
        //                         },
        //                         "in": "$$tmp.userID"
        //                     }
        //                 }
        //             }
        //         },
        //         {
        //             $match: {
        //                 userIdCreate: new mongoose.Types.ObjectId(userId)
        //             }
        //         },);
        // }
        aggregateData.push({
            $facet:
            {
                viewed: viewedFacet,
                reach: reachFacet,
                impresi: impresiFacet,
                CTA: CTAFacet,
                CTACount: CTACountFacet,
                viewTime: viewTimeFacet,
                clickTime: clickTimeFacet,
                status: [
                    {
                        $group: {
                            _id: "$ads_data",
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            data: {
                                "$first": "$_id"
                            },
                        }
                    },
                ],
            }
        },
        {
            $project: {
                // statusIklan: {
                //     "$arrayElemAt": [{
                //         "$let": {
                //             "vars": {
                //                 "tmp": { "$arrayElemAt": ["$status", 0] },
                //             },
                //             "in": "$$tmp.data.status"
                //         }
                //     }, 0]
                // },
                saldoKredit: {
                    $sum: [
                        {
                            $convert: {
                                input: { "$arrayElemAt": ['$viewTime.count', 0] },
                                to: "int",
                                onError: 0,
                                onNull: 0
                            }
                        },
                        {
                            $convert: {
                                input: { "$arrayElemAt": ['$clickTime.count', 0] },
                                to: "int",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    ]
                },
                Totalimpresi: {
                    "$let": {
                        "vars": {
                            "tmp": { "$arrayElemAt": ["$viewed", 0] },
                        },
                        "in": "$$tmp.impresi"
                    }
                },
                Totalreach: {
                    "$let": {
                        "vars": {
                            "tmp": { "$arrayElemAt": ["$viewed", 0] },
                        },
                        "in": "$$tmp.reach"
                    }
                },
                TotalCTA: {
                    "$let": {
                        "vars": {
                            "tmp": { "$arrayElemAt": ["$CTACount", 0] },
                        },
                        "in": "$$tmp.CTACount"
                    }
                },
                impresi: 1,
                reach: 1,
                CTA: 1
            }
        }
        );
        console.log(JSON.stringify(aggregateData));
        let query = await this.userAdsModel.aggregate(aggregateData);
        return query;
    }

    async Dashboard(start_date: any, end_date: any) {
        var pipelineMatch = [];
        if (start_date != null && end_date != null) {
            var andExpr = [];
            andExpr.push({ $gte: ["$timestamp", start_date.toISOString()] });
            andExpr.push({ $lte: ["$timestamp", end_date.toISOString()] });
            pipelineMatch.push({
                $match:
                {
                    $expr: {
                        $and: andExpr
                    }
                },
            })
        }
        pipelineMatch.push(
            {
                $lookup: {
                    from: "newUserBasics",
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
                    from: "adspricecredits",
                    localField: "idAdspricecredits",
                    foreignField: "_id",
                    as: "adspricecredits_data"
                }
            },
            {
                $project: {
                    _id: 1,
                    creditPrice: "$adspricecredits",
                    creditPrice_backup: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adspricecredits_data", 0] },
                            },
                            "in": "$$tmp.creditPrice"
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
                            $match: {
                                status: "ACTIVE",
                            }
                        },
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
                            $match: {
                                status: "ACTIVE",
                            }
                        },
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
                            $match: {
                                status: "ACTIVE",
                            }
                        },
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
                    creditPrice: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$creditPrice", 0] },
                            },
                            "in": "$$tmp._id"
                        }
                    },
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
            },
        );

        //------------FACET VIEWED------------
        var viewedFacet = [];
        if (start_date != undefined && end_date != undefined) {
            viewedFacet.push({
                $match: {
                    updateAt: {
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
                path: "$updateAt",
                includeArrayIndex: 'updateAt_index',
            }
        });
        if (start_date != undefined && end_date != undefined) {
            viewedFacet.push({
                $match: {
                    updateAt: {
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

        //------------FACET CTA COUNT------------
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

        //------------FACET VIEWTIME------------
        var viewTimeFacet = [];
        if (start_date != undefined && end_date != undefined) {
            viewTimeFacet.push({
                $match: {
                    updateAt: {
                        $elemMatch: {
                            $gte: start_date.toISOString(),
                            $lte: end_date.toISOString()
                        }
                    }
                }
            });
        }
        viewTimeFacet.push(
            {
                $lookup:
                {
                    from: "ads",
                    as: "adsTable",
                    let:
                    {
                        type_fk: "$adsID"
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
                                $lookup: {
                                    from: "adstypes",
                                    localField: "typeAdsID",
                                    foreignField: "_id",
                                    as: "adstypes_data"
                                }
                            },
                            {
                                $project:
                                {
                                    CPV:1,
                                    CPV_adstypes: {
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$adstypes_data", 0] },
                                            },
                                            "in": "$$tmp.CPV"
                                        }
                                    },
                                }
                            }
                        ]
                }
            },
            {
                $unwind:
                {
                    path: "$updateAt",
                    includeArrayIndex: 'updateAt_index',
                }
            });
        if (start_date != undefined && end_date != undefined) {
            viewTimeFacet.push({
                $match: {
                    updateAt: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        viewTimeFacet.push(
            {
                $project: {
                    CPV: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adsTable", 0] },
                            },
                            "in": "$$tmp.CPV"
                        }
                    },
                }
            },
            {
                $group: {
                    _id: null,
                    row: { $sum: 1 },
                    count: { $sum: "$CPV" }
                }
            });

        //------------FACET CLICKTIME------------
        var clickTimeFacet = [];
        if (start_date != undefined && end_date != undefined) {
            clickTimeFacet.push({
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
        clickTimeFacet.push(
            {
                $lookup:
                {
                    from: "ads",
                    as: "adsTable",
                    let:
                    {
                        type_fk: "$adsID"
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
                                $lookup: {
                                    from: "adstypes",
                                    localField: "typeAdsID",
                                    foreignField: "_id",
                                    as: "adstypes_data"
                                }
                            },
                            {
                                $project:
                                {
                                    CPA:1,
                                    CPA_adstypes: {
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$adstypes_data", 0] },
                                            },
                                            "in": "$$tmp.CPA"
                                        }
                                    },
                                }
                            }
                        ]
                }
            },
            {
                $unwind:
                {
                    path: "$clickTime",
                    includeArrayIndex: 'clickTime_index',
                }
            });
        if (start_date != undefined && end_date != undefined) {
            clickTimeFacet.push({
                $match: {
                    clickTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        clickTimeFacet.push(
            {
                $project: {
                    CPA: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adsTable", 0] },
                            },
                            "in": "$$tmp.CPA"
                        }
                    },
                }
            },
            {
                $group: {
                    _id: null,
                    row: { $sum: 1 },
                    count: { $sum: "$CPA" }
                }
            });

        //------------FACET CLICKTIME------------
        var priceTot = [];
        if (start_date != undefined && end_date != undefined) {
            priceTot.push({
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
        priceTot.push(
            {
                $lookup:
                {
                    from: "ads",
                    as: "adsTable",
                    let:
                    {
                        type_fk: "$adsID"
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
                                    adspricecredits: 1,
                                    CPA: 1,
                                    CPV: 1,
                                    totalClick: 1,
                                    totalView: 1,
                                }
                            }
                        ]
                }
            },
            {
                $unwind:
                {
                    path: "$clickTime",
                    includeArrayIndex: 'clickTime_index',
                }
            });
        if (start_date != undefined && end_date != undefined) {
            priceTot.push({
                $match: {
                    clickTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        priceTot.push(
            {
                $project: {
                    total: {
                        $sum : [
                            {
                                $multiply: [
                                    {
                                        $multiply: [
                                            {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": { "$arrayElemAt": ["$adsTable", 0] },
                                                    },
                                                    "in": "$$tmp.CPV"
                                                }
                                            },
                                            {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": { "$arrayElemAt": ["$adsTable", 0] },
                                                    },
                                                    "in": "$$tmp.totalView"
                                                }
                                            },
                                        ]
                                    },
                                    {
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$adsTable", 0] },
                                            },
                                            "in": "$$tmp.adspricecredits"
                                        }
                                    }
                                ]
                            },
                            {
                                $multiply: [
                                    {
                                        $multiply: [
                                            {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": { "$arrayElemAt": ["$adsTable", 0] },
                                                    },
                                                    "in": "$$tmp.CPA"
                                                }
                                            },
                                            {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": { "$arrayElemAt": ["$adsTable", 0] },
                                                    },
                                                    "in": "$$tmp.totalClick"
                                                }
                                            },
                                        ]
                                    },
                                    {
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$adsTable", 0] },
                                            },
                                            "in": "$$tmp.adspricecredits"
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: "$total" }
                }
            }
        );

        // //------------FACET CLICK PRICE COUNT------------
        // var priceClickFacet = [];
        // if (start_date != undefined && end_date != undefined) {
        //     priceClickFacet.push({
        //         $match: {
        //             clickTime: {
        //                 $elemMatch: {
        //                     $gte: start_date.toISOString(),
        //                     $lte: end_date.toISOString()
        //                 }
        //             }
        //         }
        //     });
        // }
        // priceClickFacet.push(
        //     {
        //         $lookup:
        //         {
        //             from: "ads",
        //             as: "adsTable",
        //             let:
        //             {
        //                 type_fk: "$adsID"
        //             },
        //             pipeline:
        //                 [
        //                     {
        //                         $match:
        //                         {
        //                             $expr:
        //                             {
        //                                 $eq:
        //                                     [
        //                                         "$_id",
        //                                         "$$type_fk"
        //                                     ]
        //                             }
        //                         },
        //                     },
        //                     {
        //                         $lookup: {
        //                             from: "adstypes",
        //                             localField: "typeAdsID",
        //                             foreignField: "_id",
        //                             as: "adstypes_data"
        //                         }
        //                     },
        //                     {
        //                         $project:
        //                         {
        //                             adspricecredits: 1,
        //                             CPA: 1,
        //                             CPA_adstypes: {
        //                                 "$let": {
        //                                     "vars": {
        //                                         "tmp": { "$arrayElemAt": ["$adstypes_data", 0] },
        //                                     },
        //                                     "in": "$$tmp.CPA"
        //                                 }
        //                             },
        //                         }
        //                     }
        //                 ]
        //         }
        //     },
        //     {
        //         $unwind:
        //         {
        //             path: "$clickTime",
        //             includeArrayIndex: 'clickTime_index',
        //         }
        //     });
        // if (start_date != undefined && end_date != undefined) {
        //     priceClickFacet.push({
        //         $match: {
        //             clickTime: {
        //                 $gte: start_date.toISOString(),
        //                 $lte: end_date.toISOString()
        //             }
        //         }
        //     });
        // }
        // priceClickFacet.push(
        //     {
        //         $project: {
        //             adspricecredits: {
        //                 "$let": {
        //                     "vars": {
        //                         "tmp": { "$arrayElemAt": ["$adsTable", 0] },
        //                     },
        //                     "in": "$$tmp.adspricecredits"
        //                 }
        //             },
        //             CPA: {
        //                 "$let": {
        //                     "vars": {
        //                         "tmp": { "$arrayElemAt": ["$adsTable", 0] },
        //                     },
        //                     "in": "$$tmp.CPA"
        //                 }
        //             },
        //             tot: {
        //                 $multiply: [
        //                     {
        //                         "$let": {
        //                             "vars": {
        //                                 "tmp": { "$arrayElemAt": ["$adsTable", 0] },
        //                             },
        //                             "in": "$$tmp.adspricecredits"
        //                         }
        //                     },
        //                     {
        //                         "$let": {
        //                             "vars": {
        //                                 "tmp": { "$arrayElemAt": ["$adsTable", 0] },
        //                             },
        //                             "in": "$$tmp.CPA"
        //                         }
        //                     }
        //                 ]
        //             },
        //         }
        //     },
        //     {
        //         $group: {
        //             _id: null,
        //             count: { $sum: "$tot" }
        //         }
        //     }
        // );

        // //------------FACET VIEW PRICE COUNT------------
        // var priceViewFacet = [];
        // if (start_date != undefined && end_date != undefined) {
        //     priceViewFacet.push({
        //         $match: {
        //             updateAt: {
        //                 $elemMatch: {
        //                     $gte: start_date.toISOString(),
        //                     $lte: end_date.toISOString()
        //                 }
        //             }
        //         }
        //     });
        // }
        // priceViewFacet.push(
        //     {
        //         $lookup:
        //         {
        //             from: "ads",
        //             as: "adsTable",
        //             let:
        //             {
        //                 type_fk: "$adsID"
        //             },
        //             pipeline:
        //                 [
        //                     {
        //                         $match:
        //                         {
        //                             $expr:
        //                             {
        //                                 $eq:
        //                                     [
        //                                         "$_id",
        //                                         "$$type_fk"
        //                                     ]
        //                             }
        //                         },
        //                     },
        //                     {
        //                         $lookup: {
        //                             from: "adstypes",
        //                             localField: "typeAdsID",
        //                             foreignField: "_id",
        //                             as: "adstypes_data"
        //                         }
        //                     },
        //                     {
        //                         $project:
        //                         {
        //                             adspricecredits: 1,
        //                             CPV: 1,
        //                             CPV_adstypes: {
        //                                 "$let": {
        //                                     "vars": {
        //                                         "tmp": { "$arrayElemAt": ["$adstypes_data", 0] },
        //                                     },
        //                                     "in": "$$tmp.CPV"
        //                                 }
        //                             },
        //                         }
        //                     }
        //                 ]
        //         }
        //     },
        //     {
        //         $unwind:
        //         {
        //             path: "$updateAt",
        //             includeArrayIndex: 'updateAt_index',
        //         }
        //     });
        // if (start_date != undefined && end_date != undefined) {
        //     priceViewFacet.push({
        //         $match: {
        //             updateAt: {
        //                 $gte: start_date.toISOString(),
        //                 $lte: end_date.toISOString()
        //             }
        //         }
        //     });
        // }
        // priceViewFacet.push(
        //     {
        //         $project: {
        //             adspricecredits: {
        //                 "$let": {
        //                     "vars": {
        //                         "tmp": { "$arrayElemAt": ["$adsTable", 0] },
        //                     },
        //                     "in": "$$tmp.adspricecredits"
        //                 }
        //             },
        //             CPV: {
        //                 "$let": {
        //                     "vars": {
        //                         "tmp": { "$arrayElemAt": ["$adsTable", 0] },
        //                     },
        //                     "in": "$$tmp.CPV"
        //                 }
        //             },
        //             tot: {
        //                 $multiply: [
        //                     {
        //                         "$let": {
        //                             "vars": {
        //                                 "tmp": { "$arrayElemAt": ["$adsTable", 0] },
        //                             },
        //                             "in": "$$tmp.adspricecredits"
        //                         }
        //                     },
        //                     {
        //                         "$let": {
        //                             "vars": {
        //                                 "tmp": { "$arrayElemAt": ["$adsTable", 0] },
        //                             },
        //                             "in": "$$tmp.CPV"
        //                         }
        //                     }
        //                 ]
        //             },
        //         }
        //     },
        //     {
        //         $group: {
        //             _id: null,
        //             count: { $sum: "$tot" }
        //         }
        //     }
        //     );
            
        var aggregateData = [];
        aggregateData.push(
            {
                $addFields: {
                    dateStart: start_date,
                    dateEnd: end_date
                }
            },
            {
                $match:
                {
                    adsObjectivitasId: { $ne: null }
                },
            },
            {
                $lookup:
                {
                    from: "ads",
                    as: "ads_data",
                    pipeline: pipelineMatch
                }
            },);

        aggregateData.push(
            {
                $facet:
                {
                    viewed: viewedFacet,
                    CTACount: CTACountFacet,
                    viewTime: viewTimeFacet,
                    clickTime: clickTimeFacet, 
                    priceTot: priceTot,
                    // priceViewFacet: priceViewFacet,
                    // priceClickFacet: priceClickFacet,
                    ads: [
                        {
                            $group: {
                                _id: "$ads_data",
                                count: { $sum: 1 }
                            }
                        },
                    ],
                }
            },
            {
                $project: {
                    saldoKredit: {
                        $sum: [
                            {
                                $convert: {
                                    input: { "$arrayElemAt": ['$viewTime.count', 0] },
                                    to: "int",
                                    onError: 0,
                                    onNull: 0
                                }
                            },
                            {
                                $convert: {
                                    input: { "$arrayElemAt": ['$clickTime.count', 0] },
                                    to: "int",
                                    onError: 0,
                                    onNull: 0
                                }
                            }
                        ]
                    },
                    Totalimpresi: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$viewed", 0] },
                            },
                            "in": "$$tmp.impresi"
                        }
                    },
                    TotalCTA: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$CTACount", 0] },
                            },
                            "in": "$$tmp.CTACount"
                        }
                    },
                    CTA: 1,
                    totalAds: {
                        $let: {
                            "vars": {
                                ads: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$ads", 0] },
                                            },
                                            "in": "$$tmp._id"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$ads.totalAds"
                        }
                    },
                    totalAdvertisers: {
                        $let: {
                            "vars": {
                                ads: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$ads", 0] },
                                            },
                                            "in": "$$tmp._id"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$ads.totalAdvertisers"
                        }
                    },
                    statusAds: {
                        $let: {
                            "vars": {
                                ads: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$ads", 0] },
                                            },
                                            "in": "$$tmp._id"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$ads.statusAds"
                        }
                    },
                    creditPrice: {
                        $let: {
                            "vars": {
                                ads: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$ads", 0] },
                                            },
                                            "in": "$$tmp._id"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$ads.creditPrice"
                        }
                    },
                    adsType: {
                        $let: {
                            "vars": {
                                ads: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$ads", 0] },
                                            },
                                            "in": "$$tmp._id"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$ads.adsType"
                        }
                    },
                    adsObjectivitas: {
                        $let: {
                            "vars": {
                                ads: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$ads", 0] },
                                            },
                                            "in": "$$tmp._id"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$ads.adsObjectivitas"
                        }
                    },
                    adsPlanShows: {
                        $let: {
                            "vars": {
                                ads: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$ads", 0] },
                                            },
                                            "in": "$$tmp._id"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$ads.adsPlanShows"
                        }
                    },
                    // totalIncome: {
                    //     $multiply: [{
                    //         $sum: [
                    //             {
                    //                 $convert: {
                    //                     input: { "$arrayElemAt": ['$viewTime.count', 0] },
                    //                     to: "int",
                    //                     onError: 0,
                    //                     onNull: 0
                    //                 }
                    //             },
                    //             {
                    //                 $convert: {
                    //                     input: { "$arrayElemAt": ['$clickTime.count', 0] },
                    //                     to: "int",
                    //                     onError: 0,
                    //                     onNull: 0
                    //                 }
                    //             }
                    //         ]
                    //     }, 
                    //     {
                    //         "$let": {
                    //             "vars": {
                    //                 ads: {
                    //                     "$arrayElemAt": [{
                    //                         "$let": {
                    //                             "vars": {
                    //                                 "tmp": { "$arrayElemAt": ["$ads", 0] },
                    //                             },
                    //                             "in": "$$tmp._id"
                    //                         }
                    //                     }, 0]
                    //                 }
                    //             },
                    //             "in": "$$ads.creditPrice"
                    //         }
                    //     },]
                    // },
                    // totalIncome:{
                    //     $sum: [
                    //         {
                    //             $convert: {
                    //                 input: { "$arrayElemAt": ['$priceViewFacet.count', 0] },
                    //                 to: "int",
                    //                 onError: 0,
                    //                 onNull: 0
                    //             }
                    //         },
                    //         {
                    //             $convert: {
                    //                 input: { "$arrayElemAt": ['$priceClickFacet.count', 0] },
                    //                 to: "int",
                    //                 onError: 0,
                    //                 onNull: 0
                    //             }
                    //         }
                    //     ]
                    // }
                    // priceViewFacet: 1,
                    // priceClickFacet:1
                    totalIncome: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$priceTot", 0] },
                            },
                            "in": "$$tmp.count"
                        }
                    },
                }
            }
        );

        //console.log(JSON.stringify(aggregateData));
        let query = await this.userAdsModel.aggregate(aggregateData);
        return query;
    }

    async campaignDetailSummary(adsId: string, start_date: any, end_date: any) {
        var andMatch = [];
        if (start_date != null && end_date != null) {
            start_date = new Date(start_date);
            end_date = new Date(end_date);
            end_date.setDate(end_date.getDate() + 1);
            andMatch.push({ $gte: ["$timestamp", start_date.toISOString()] },
                { $lte: ["$timestamp", end_date.toISOString()] })
        }
        andMatch.push({ $eq: ["$_id", "$$adsID"] });

        //------------FACET VIEWED------------
        var viewedFacet = [];
        var andMatchviewedFacet = [];
        andMatchviewedFacet.push({ adsID: new mongoose.Types.ObjectId(adsId) });
        if (start_date != null && end_date != null) {
            andMatchviewedFacet.push({
                viewTime: {
                    $elemMatch: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        viewedFacet.push({
            $match: {
                $and: andMatchviewedFacet
            }
        },
            {
                $unwind:
                {
                    path: "$viewTime",
                    includeArrayIndex: 'viewTime_index',
                }
            })
        if (start_date != null && end_date != null) {
            viewedFacet.push({
                $match: {
                    viewTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            })
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

        //------------FACET REACH------------
        var reachFacet = [];
        var andMatchreachFacet = [];
        andMatchreachFacet.push({ adsID: new mongoose.Types.ObjectId(adsId) });
        if (start_date != null && end_date != null) {
            andMatchreachFacet.push({
                viewTime: {
                    $elemMatch: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        reachFacet.push({
            $match: {
                $and: andMatchreachFacet
            }
        },
            {
                $unwind:
                {
                    path: "$viewTime",
                    includeArrayIndex: 'viewTime_index',
                }
            })
        if (start_date != null && end_date != null) {
            reachFacet.push({
                $match: {
                    viewTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            })
        }
        reachFacet.push(
            {
                $project: {
                    userID: 1,
                    viewTime: {
                        $substr:
                            [
                                "$viewTime", 0, 10
                            ]
                    }
                }
            },
            {
                $group: {
                    _id: {
                        "viewTime": "$viewTime",
                        "userID": "$userID"
                    },
                    "userIDCount": { "$sum": 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.viewTime",
                    viewTime: {
                        $push: {
                            "userID": "$_id.userID",
                            "count": "$userIDCount"
                        },
                    },
                    count: { "$sum": "$userIDCount" }
                }
            },
            {
                $project: {
                    _id: "$_id",
                    reachView: { $size: "$viewTime" }
                }
            });

        //------------FACET IMPRESI------------
        var impresiFacet = [];
        var andMatchimpresiFacet = [];
        andMatchimpresiFacet.push({ adsID: new mongoose.Types.ObjectId(adsId) });
        if (start_date != null && end_date != null) {
            andMatchimpresiFacet.push({
                viewTime: {
                    $elemMatch: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        impresiFacet.push({
            $match: {
                $and: andMatchimpresiFacet
            }
        },
            {
                $unwind:
                {
                    path: "$viewTime",
                    includeArrayIndex: 'viewTime_index',
                }
            })
        if (start_date != null && end_date != null) {
            impresiFacet.push({
                $match: {
                    viewTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            })
        }
        impresiFacet.push(
            {
                $project: {
                    viewTime: {
                        $substr:
                            [
                                "$viewTime", 0, 10
                            ]
                    }
                }
            },
            {
                $group:
                {
                    _id: "$viewTime",
                    impresiView:
                    {
                        "$sum": 1
                    }
                }
            },);

        //------------FACET CTA------------
        var CTAFacet = [];
        var andMatchCTAFacet = [];
        andMatchCTAFacet.push({ adsID: new mongoose.Types.ObjectId(adsId) });
        if (start_date != null && end_date != null) {
            andMatchCTAFacet.push({
                clickTime: {
                    $elemMatch: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        CTAFacet.push({
            $match: {
                $and: andMatchCTAFacet
            }
        },
            {
                $unwind:
                {
                    path: "$clickTime",
                    includeArrayIndex: 'clickTime_index',
                }
            })
        if (start_date != null && end_date != null) {
            CTAFacet.push({
                $match: {
                    clickTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            })
        }
        CTAFacet.push(
            {
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
            },);

        //------------FACET CTA COUNT------------
        var CTACountFacet = [];
        var andMatchCTACountFacet = [];
        andMatchCTACountFacet.push({ adsID: new mongoose.Types.ObjectId(adsId) });
        if (start_date != null && end_date != null) {
            andMatchCTACountFacet.push({
                clickTime: {
                    $elemMatch: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        CTACountFacet.push({
            $match: {
                $and: andMatchCTACountFacet
            }
        },
            {
                $unwind:
                {
                    path: "$clickTime",
                    includeArrayIndex: 'clickTime_index',
                }
            })
        if (start_date != null && end_date != null) {
            CTACountFacet.push({
                $match: {
                    clickTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            })
        }
        CTACountFacet.push(
            {
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
            },);

        //------------FACET VIEWTIME------------
        var viewTimeFacet = [];
        var andMatchviewTimeFacet = [];
        andMatchviewTimeFacet.push({ adsID: new mongoose.Types.ObjectId(adsId) });
        if (start_date != null && end_date != null) {
            andMatchviewTimeFacet.push({
                viewTime: {
                    $elemMatch: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        viewTimeFacet.push({
            $match: {
                $and: andMatchviewTimeFacet
            }
        },
            {
                $lookup:
                {
                    from: "ads",
                    as: "adsTable",
                    let:
                    {
                        type_fk: "$adsID"
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
                                $lookup: {
                                    from: "adstypes",
                                    localField: "typeAdsID",
                                    foreignField: "_id",
                                    as: "adstypes_data"
                                }
                            },
                            {
                                $project:
                                {
                                    CPV: {
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$adstypes_data", 0] },
                                            },
                                            "in": "$$tmp.CPV"
                                        }
                                    },
                                }
                            }
                        ]
                }
            },
            {
                $unwind:
                {
                    path: "$viewTime",
                    includeArrayIndex: 'viewTime_index',
                }
            })
        if (start_date != null && end_date != null) {
            viewTimeFacet.push({
                $match: {
                    viewTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            })
        }
        viewTimeFacet.push(
            {
                $project: {
                    CPV: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adsTable", 0] },
                            },
                            "in": "$$tmp.CPV"
                        }
                    },
                }
            },
            {
                $group: {
                    _id: null,
                    row: { $sum: 1 },
                    count: { $sum: "$CPV" }
                }
            });

        //------------FACET CLICKTIME------------
        var clickTimeFacet = [];
        var andMatchclickTimeFacet = [];
        andMatchclickTimeFacet.push({ adsID: new mongoose.Types.ObjectId(adsId) });
        if (start_date != null && end_date != null) {
            andMatchclickTimeFacet.push({
                clickTime: {
                    $elemMatch: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        clickTimeFacet.push(
            {
                $match: {
                    $and: andMatchclickTimeFacet
                }
            },
            {
                $lookup:
                {
                    from: "ads",
                    as: "adsTable",
                    let:
                    {
                        type_fk: "$adsID"
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
                                $lookup: {
                                    from: "adstypes",
                                    localField: "typeAdsID",
                                    foreignField: "_id",
                                    as: "adstypes_data"
                                }
                            },
                            {
                                $project:
                                {
                                    CPA: {
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$adstypes_data", 0] },
                                            },
                                            "in": "$$tmp.CPA"
                                        }
                                    },
                                }
                            }
                        ]
                }
            },
            {
                $unwind:
                {
                    path: "$clickTime",
                    includeArrayIndex: 'clickTime_index',
                }
            },)
        if (start_date != null && end_date != null) {
            clickTimeFacet.push({
                $match: {
                    clickTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            })
        }
        clickTimeFacet.push(
            {
                $project: {
                    CPA: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adsTable", 0] },
                            },
                            "in": "$$tmp.CPA"
                        }
                    },
                }
            },
            {
                $group: {
                    _id: null,
                    row: { $sum: 1 },
                    count: { $sum: "$CPA" }
                }
            });

        //------------FACET USERADS------------
        var userAdsFacet = [];
        var andMatchuserAdsFacet = [];
        andMatchuserAdsFacet.push({ adsID: new mongoose.Types.ObjectId(adsId) });
        if (start_date != null && end_date != null) {
            andMatchuserAdsFacet.push({
                viewTime: {
                    $elemMatch: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        userAdsFacet.push(
            {
                $match: {
                    $and: andMatchuserAdsFacet
                }
            },
            {
                $lookup: {
                    from: 'userbasics',
                    as: 'userbasics_data',
                    let: {
                        local_id: "$userID"
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
                                _id: 1,
                                email: 1,
                                fullName: 1,
                                gender: {
                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $or: [
                                                        { $eq: ["$gender", "Male"] },
                                                        { $eq: ["$gender", "Laki-laki"] },
                                                        { $eq: ["$gender", "MALE"] }
                                                    ]
                                                }, then: "Laki-laki"
                                            },
                                            {
                                                case: {
                                                    $or: [
                                                        { $eq: ["$gender", " Perempuan"] },
                                                        { $eq: ["$gender", "Perempuan"] },
                                                        { $eq: ["$gender", "PEREMPUAN"] },
                                                        { $eq: ["$gender", "FEMALE"] },
                                                        { $eq: ["$gender", " FEMALE"] }
                                                    ]
                                                }, then: "Perempuan"
                                            }
                                        ],
                                        "default": "Lainnya"
                                    }
                                },
                                age: {
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
                                ageQualication: {
                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $lt: [{
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
                                                    }, 14]
                                                },
                                                then: "< 14 Tahun"
                                            },
                                            {
                                                case: {
                                                    $and: [{
                                                        $gte: [{
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
                                                        }, 14]
                                                    }, {
                                                        $lte: [{
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
                                                        }, 28]
                                                    }]
                                                },
                                                then: "14 - 28 Tahun"
                                            },
                                            {
                                                case: {
                                                    $and: [{
                                                        $gte: [{
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
                                                        }, 29]
                                                    }, {
                                                        $lte: [{
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
                                                        }, 43]
                                                    }]
                                                },
                                                then: "29 - 43 Tahun"
                                            },
                                            {
                                                case: {
                                                    $gt: [{
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
                                                    }, 43]
                                                },
                                                then: "> 43 Tahun"
                                            },
                                        ],
                                        "default": "Other"
                                    }
                                },
                                userInterests_array: {
                                    $map: {
                                        input: {
                                            $map: {
                                                input: "$userInterests",
                                                in: {
                                                    $arrayElemAt: [{ $objectToArray: "$$this" }, 1]
                                                },
                                            }
                                        },
                                        in: "$$this.v"
                                    }
                                },
                                states: 1,
                            }
                        },
                        {
                            $lookup: {
                                from: "interests_repo",
                                localField: "userInterests_array",
                                foreignField: "_id",
                                as: "interests"
                            }
                        },
                        {
                            $lookup: {
                                from: 'areas',
                                as: 'areas',
                                let: {
                                    local_id: "$states.$id"
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
                                ]
                            }
                        },
                        // {
                        //     $group:
                        //     {
                        //         _id: "$clickTime",
                        //         CTACount:
                        //         {
                        //             "$sum": 1
                        //         }
                        //     }
                        // }
                    ],
                },
            },
            {
                $unwind:
                {
                    path: "$clickTime",
                    includeArrayIndex: 'clickTime_index',
                }
            },)
        if (start_date != null && end_date != null) {
            userAdsFacet.push({
                $match: {
                    clickTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            })
        }
        userAdsFacet.push(
            {
                $group: {
                    _id: "$userID",
                    user: { "$first": "$$ROOT" },
                },
            },
            {
                $project: {
                    _id: 1,
                    gender: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                            },
                            "in": "$$tmp.gender"
                        }
                    },
                    ageQualication: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                            },
                            "in": "$$tmp.ageQualication"
                        }
                    },
                    interest: {
                        $map: {
                            input: {
                                $map: {
                                    input: {
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                                            },
                                            "in": "$$tmp.interests"
                                        }
                                    },
                                    in: {
                                        $arrayElemAt: [{ $objectToArray: "$$this" }, 1]
                                    },
                                }
                            },
                            in: "$$this.v"
                        }
                    },
                    areas: {
                        $let: {
                            "vars": {
                                userauths: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                                            },
                                            "in": "$$tmp.areas"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$userauths.stateName"
                        }
                    },
                }
            });

        let query = await this.userAdsModel.aggregate([
            {
                $addFields: {
                    dateStart: start_date,
                    dateEnd: end_date,
                    paramadsId: new mongoose.Types.ObjectId(adsId)
                }
            },
            {
                $lookup:
                {
                    from: "ads",
                    as: "ads_data",
                    let:
                    {
                        adsID: "$paramadsId",
                        dateStart_: "$dateStart",
                        dateEnd_: "$dateEnd"
                    },
                    pipeline:
                    [
                        {
                            $match:
                            {
                                $expr: {
                                    $and: andMatch
                                }
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
                    ]
                }
            },
            {
                $facet:
                {
                    adsDetail: [
                        {
                            $group: {
                                _id: "$ads_data",
                                userIDCount: { "$sum": 1 }
                            },
                        },
                        {
                            $project: {
                                _id: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp._id"
                                    }
                                },
                                campaignId: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.campaignId"
                                    }
                                },
                                name: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.name"
                                    }
                                },
                                description: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.description"
                                    }
                                },
                                typeAdsID: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.typeAdsID"
                                    }
                                },
                                typeAdsIDName: {
                                    $let: {
                                        "vars": {
                                            adstypes: {
                                                "$arrayElemAt": [{
                                                    "$let": {
                                                        "vars": {
                                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                                        },
                                                        "in": "$$tmp.adstypes_data"
                                                    }
                                                }, 0]
                                            }
                                        },
                                        "in": "$$adstypes.nameType"
                                    }
                                },
                                liveAt: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.liveAt"
                                    }
                                },
                                liveEnd: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.liveEnd"
                                    }
                                },
                                urlLink: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.urlLink"
                                    }
                                },
                                tayang: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.tayang"
                                    }
                                },
                                credit: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.credit"
                                    }
                                },
                                objectivitasId: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.adsObjectivitasId"
                                    }
                                },
                                objectivitasIdNameId: {
                                    $let: {
                                        "vars": {
                                            adsobjectivitas: {
                                                "$arrayElemAt": [{
                                                    "$let": {
                                                        "vars": {
                                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                                        },
                                                        "in": "$$tmp.adsobjectivitas_data"
                                                    }
                                                }, 0]
                                            }
                                        },
                                        "in": "$$adsobjectivitas.name_id"
                                    }
                                },
                                objectivitasIdNameEn: {
                                    $let: {
                                        "vars": {
                                            adsobjectivitas: {
                                                "$arrayElemAt": [{
                                                    "$let": {
                                                        "vars": {
                                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                                        },
                                                        "in": "$$tmp.adsobjectivitas_data"
                                                    }
                                                }, 0]
                                            }
                                        },
                                        "in": "$$adsobjectivitas.name_en"
                                    }
                                },
                                audiensFrekuensi: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.audiensFrekuensi"
                                    }
                                },
                                status: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.status"
                                    }
                                },
                                dayAds: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.dayAds"
                                    }
                                },
                            }
                        }
                    ],
                    viewed: viewedFacet,
                    reach: reachFacet,
                    impresi: impresiFacet,
                    CTA: CTAFacet,
                    CTACount: CTACountFacet,
                    viewTime: viewTimeFacet,
                    clickTime: clickTimeFacet,
                    userAds: userAdsFacet,
                }
            },
            // {
            //     $facet:
            //     {
            //         adsDetail: [
            //             {
            //                 $project:{
            //                     adsDetail: { "$arrayElemAt": ["$adsDetail", 0] },
            //                 }
            //             }
            //         ],
            //         Totalimpresi: [{
            //             $project: { 
            //                 impresi: {
            //                     "$let": {
            //                         "vars": {
            //                             "tmp": { "$arrayElemAt": ["$viewed", 0] },
            //                         },
            //                         "in": "$$tmp.impresi"
            //                     }
            //                 },
            //             },
            //         }],
            //         Totalreach: [{
            //             $project: {
            //                 reach: {
            //                     "$let": {
            //                         "vars": {
            //                             "tmp": { "$arrayElemAt": ["$viewed", 0] },
            //                         },
            //                         "in": "$$tmp.reach"
            //                     }
            //                 },
            //             },
            //         }],
            //         TotalCTA: [{
            //             $project: {
            //                 CTACount: {
            //                     "$let": {
            //                         "vars": {
            //                             "tmp": { "$arrayElemAt": ["$CTACount", 0] },
            //                         },
            //                         "in": "$$tmp.CTACount"
            //                     }
            //                 },
            //             },
            //         }],
            //         CTR: [{
            //             $project: {
            //                 CTR: {
            //                     "$concat": [{
            //                         "$toString": {
            //                             "$multiply": [{
            //                                 "$divide": [{
            //                                     "$let": {
            //                                         "vars": {
            //                                             "tmp": { "$arrayElemAt": ["$CTACount", 0] },
            //                                         },
            //                                         "in": "$$tmp.CTACount"
            //                                     }
            //                                 }, {
            //                                     "$let": {
            //                                         "vars": {
            //                                             "tmp": { "$arrayElemAt": ["$viewed", 0] },
            //                                         },
            //                                         "in": "$$tmp.reach"
            //                                     }
            //                                 }]
            //                             }, 100]
            //                         }
            //                     }, "", "%"]
            //                 }
            //             },
            //         }],
            //         impresi:[
            //             {
            //                 $project:{
            //                     impresi: "$impresi",
            //                 }
            //             }
            //         ],
            //         reach: [
            //             {
            //                 $project: {
            //                     impresi: "$reach",
            //                 }
            //             }
            //         ],
            //         CTA: [
            //             {
            //                 $project: {
            //                     impresi: "$CTA",
            //                 }
            //             }
            //         ],
            //         saldoKredit: [
            //             {
            //                 $project: {
            //                     saldoKredit: {
            //                         $sum: [
            //                             {
            //                                 $convert: {
            //                                     input: { "$arrayElemAt": ['$viewTime.count', 0] },
            //                                     to: "int",
            //                                     onError: 0,
            //                                     onNull: 0
            //                                 }
            //                             },
            //                             {
            //                                 $convert: {
            //                                     input: { "$arrayElemAt": ['$clickTime.count', 0] },
            //                                     to: "int",
            //                                     onError: 0,
            //                                     onNull: 0
            //                                 }
            //                             }
            //                         ]
            //                     },
            //                 }
            //             }
            //         ],
            //         userAds: [{
            //             $project: {
            //                 userAds: "$userAds",
            //             }
            //         }],
            //         ageRange: [
            //         {
            //             $group: {
            //                 _id: "$userAds.ageQualication",
            //                 count: { $sum: 1 }
            //             },
            //         }],
            //         gender: [
            //         {
            //             $group: {
            //                 _id: "$userAds.gender",
            //                 count: { $sum: 1 }
            //             },
            //             }],
            //         interest_: [
            //             {
            //                 $project: {
            //                     userAds: "$userAds.interest",
            //                 }
            //             }],
            //         interest: [
            //         // {
            //         //     $project: {
            //         //         userAds_: "$userAds",
            //         //     }
            //         // },
            //         //     {
            //         //         $unwind: "$userAds_.gender"
            //         //     },
            //         {
            //             $group: {
            //                 _id: {
            //                     "ageQualication": "$userAds_.ageQualication",
            //                 },
            //                 count: { $sum: 1 }
            //             },
            //         },
            //         // {
            //         //     $unwind:
            //         //     {
            //         //         path: "$_id.interest",
            //         //         includeArrayIndex: 'interest_index',
            //         //     }
            //         // },
            //     ]
            //     }
            // }
            {
                $project: {
                    adsDetail: { "$arrayElemAt": ["$adsDetail", 0] },
                    summary: {
                        Totalimpresi: {
                            "$let": {
                                "vars": {
                                    "tmp": { "$arrayElemAt": ["$viewed", 0] },
                                },
                                "in": "$$tmp.impresi"
                            }
                        },
                        Totalreach: {
                            "$let": {
                                "vars": {
                                    "tmp": { "$arrayElemAt": ["$viewed", 0] },
                                },
                                "in": "$$tmp.reach"
                            }
                        },
                        TotalCTA: {
                            "$let": {
                                "vars": {
                                    "tmp": { "$arrayElemAt": ["$CTACount", 0] },
                                },
                                "in": "$$tmp.CTACount"
                            }
                        },
                        CTR: {
                            "$concat": [{
                                "$toString": {
                                    "$multiply": [{
                                        "$divide": [{
                                            "$let": {
                                                "vars": {
                                                    "tmp": { "$arrayElemAt": ["$CTACount", 0] },
                                                },
                                                "in": "$$tmp.CTACount"
                                            }
                                        }, {
                                            "$let": {
                                                "vars": {
                                                    "tmp": { "$arrayElemAt": ["$viewed", 0] },
                                                },
                                                "in": "$$tmp.reach"
                                            }
                                        }]
                                    }, 100]
                                }
                            }, "", "%"]
                        },
                        impresi: "$impresi",
                        reach: "$reach",
                        CTA: "$CTA",
                    },
                    saldoKredit: {
                        $sum: [
                            {
                                $convert: {
                                    input: { "$arrayElemAt": ['$viewTime.count', 0] },
                                    to: "int",
                                    onError: 0,
                                    onNull: 0
                                }
                            },
                            {
                                $convert: {
                                    input: { "$arrayElemAt": ['$clickTime.count', 0] },
                                    to: "int",
                                    onError: 0,
                                    onNull: 0
                                }
                            }
                        ]
                    },
                    userAds: "$userAds"
                },
            },
            // {
            //     $unwind: "$ageRange_"
            // },
            // {
            //     $project: {
            //         adsDetail: 1,
            //         summary: 1,
            //         saldoKredit: 1,
            //         ageRange: "$userAds.ageQualication",
            //         gender: "$userAds.gender",
            //         interest: "$userAds.interest",
            //         areas: "$userAds.areas",
            //     }
            // }
            // {
            //     $facet:{
            //         adsDetail: [
            //             {
            //                 $group: {
            //                     _id: "$adsDetail",
            //                 }
            //             },
            //         ],
            //         summary: [
            //             {
            //                 $group: {
            //                     _id: "$summary",
            //                 }
            //             },
            //         ],
            //         saldoKredit: [
            //             {
            //                 $group: {
            //                     _id: "$saldoKredit",
            //                 }
            //             },
            //         ],
            //         ageRange: [
            //             {
            //                 $group: {
            //                     _id: "$saldoKredit",
            //                 }
            //             },
            //         ],
            //     }
            // }

        ]);
        return query;
    }

    async campaignDetail(adsId: string, start_date: any, end_date: any) {
        var andMatch = [];
        andMatch.push({ $eq: ["$_id", "$$adsID"] });

        //------------FACET VIEWED------------
        var viewedFacet = [];
        var andMatchviewedFacet = [];
        andMatchviewedFacet.push({ adsID: new mongoose.Types.ObjectId(adsId) });
        if (start_date != null && end_date != null) {
            andMatchviewedFacet.push({
                viewTime: {
                    $elemMatch: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        viewedFacet.push({
            $match: {
                $and: andMatchviewedFacet
            }
        }, 
        {
            $unwind:
            {
                path: "$viewTime",
                includeArrayIndex: 'viewTime_index',
            }
        })
        if (start_date != null && end_date != null) {
            viewedFacet.push({
                $match: {
                    viewTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            })
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

        //------------FACET REACH------------
        var reachFacet = [];
        var andMatchreachFacet = [];
        andMatchreachFacet.push({ adsID: new mongoose.Types.ObjectId(adsId) });
        if (start_date != null && end_date != null) {
            andMatchreachFacet.push({
                viewTime: {
                    $elemMatch: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        reachFacet.push({
            $match: {
                $and: andMatchreachFacet
            }
        },
            {
                $unwind:
                {
                    path: "$viewTime",
                    includeArrayIndex: 'viewTime_index',
                }
            })
        if (start_date != null && end_date != null) {
            reachFacet.push({
                $match: {
                    viewTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            })
        }
        reachFacet.push(
            {
                $project: {
                    userID: 1,
                    viewTime: {
                        $substr:
                            [
                                "$viewTime", 0, 10
                            ]
                    }
                }
            },
            {
                $group: {
                    _id: {
                        "viewTime": "$viewTime",
                        "userID": "$userID"
                    },
                    "userIDCount": { "$sum": 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.viewTime",
                    viewTime: {
                        $push: {
                            "userID": "$_id.userID",
                            "count": "$userIDCount"
                        },
                    },
                    count: { "$sum": "$userIDCount" }
                }
            },
            {
                $project: {
                    _id: "$_id",
                    reachView: { $size: "$viewTime" }
                }
            });

        //------------FACET IMPRESI------------
        var impresiFacet = [];
        var andMatchimpresiFacet = [];
        andMatchimpresiFacet.push({ adsID: new mongoose.Types.ObjectId(adsId) });
        if (start_date != null && end_date != null) {
            andMatchimpresiFacet.push({
                viewTime: {
                    $elemMatch: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        impresiFacet.push({
            $match: {
                $and: andMatchimpresiFacet
            }
        },
            {
                $unwind:
                {
                    path: "$viewTime",
                    includeArrayIndex: 'viewTime_index',
                }
            })
        if (start_date != null && end_date != null) {
            impresiFacet.push({
                $match: {
                    viewTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            })
        }
        impresiFacet.push(
            {
                $project: {
                    viewTime: {
                        $substr:
                            [
                                "$viewTime", 0, 10
                            ]
                    }
                }
            },
            {
                $group:
                {
                    _id: "$viewTime",
                    impresiView:
                    {
                        "$sum": 1
                    }
                }
            },);

        //------------FACET CTA------------
        var CTAFacet = [];
        var andMatchCTAFacet = [];
        andMatchCTAFacet.push({ adsID: new mongoose.Types.ObjectId(adsId) });
        if (start_date != null && end_date != null) {
            andMatchCTAFacet.push({
                clickTime: {
                    $elemMatch: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        CTAFacet.push({
            $match: {
                $and: andMatchCTAFacet
            }
        },
            {
                $unwind:
                {
                    path: "$clickTime",
                    includeArrayIndex: 'clickTime_index',
                }
            })
        if (start_date != null && end_date != null) {
            CTAFacet.push({
                $match: {
                    clickTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            })
        }
        CTAFacet.push(
            {
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
            },);

        //------------FACET CTA COUNT------------
        var CTACountFacet = [];
        var andMatchCTACountFacet = [];
        andMatchCTACountFacet.push({ adsID: new mongoose.Types.ObjectId(adsId) });
        if (start_date != null && end_date != null) {
            andMatchCTACountFacet.push({
                clickTime: {
                    $elemMatch: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        CTACountFacet.push({
            $match: {
                $and: andMatchCTACountFacet
            }
        },
            {
                $unwind:
                {
                    path: "$clickTime",
                    includeArrayIndex: 'clickTime_index',
                }
            })
        if (start_date != null && end_date != null) {
            CTACountFacet.push({
                $match: {
                    clickTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            })
        }
        CTACountFacet.push(
            {
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
            },);

        //------------FACET VIEWTIME------------
        var viewTimeFacet = [];
        var andMatchviewTimeFacet = [];
        andMatchviewTimeFacet.push({ adsID: new mongoose.Types.ObjectId(adsId) });
        if (start_date != null && end_date != null) {
            andMatchviewTimeFacet.push({
                viewTime: {
                    $elemMatch: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        viewTimeFacet.push({
            $match: {
                $and: andMatchviewTimeFacet
            }
        },
            {
                $lookup:
                {
                    from: "ads",
                    as: "adsTable",
                    let:
                    {
                        type_fk: "$adsID"
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
                                $lookup: {
                                    from: "adstypes",
                                    localField: "typeAdsID",
                                    foreignField: "_id",
                                    as: "adstypes_data"
                                }
                            },
                            {
                                $project:
                                {
                                    CPV: {
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$adstypes_data", 0] },
                                            },
                                            "in": "$$tmp.CPV"
                                        }
                                    },
                                }
                            }
                        ]
                }
            },
            {
                $unwind:
                {
                    path: "$viewTime",
                    includeArrayIndex: 'viewTime_index',
                }
            })
        if (start_date != null && end_date != null) {
            viewTimeFacet.push({
                $match: {
                    viewTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            })
        }
        viewTimeFacet.push(
            {
                $project: {
                    CPV: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adsTable", 0] },
                            },
                            "in": "$$tmp.CPV"
                        }
                    },
                }
            },
            {
                $group: {
                    _id: null,
                    row: { $sum: 1 },
                    count: { $sum: "$CPV" }
                }
            });

        //------------FACET CLICKTIME------------
        var clickTimeFacet = [];
        var andMatchclickTimeFacet = [];
        andMatchclickTimeFacet.push({ adsID: new mongoose.Types.ObjectId(adsId) });
        if (start_date != null && end_date != null) {
            andMatchclickTimeFacet.push({
                clickTime: {
                    $elemMatch: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        clickTimeFacet.push(
            {
            $match: {
                $and: andMatchclickTimeFacet
            }
            },
            {
                $lookup:
                {
                    from: "ads",
                    as: "adsTable",
                    let:
                    {
                        type_fk: "$adsID"
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
                                $lookup: {
                                    from: "adstypes",
                                    localField: "typeAdsID",
                                    foreignField: "_id",
                                    as: "adstypes_data"
                                }
                            },
                            {
                                $project:
                                {
                                    CPA: {
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$adstypes_data", 0] },
                                            },
                                            "in": "$$tmp.CPA"
                                        }
                                    },
                                }
                            }
                        ]
                }
            },
            {
                $unwind:
                {
                    path: "$clickTime",
                    includeArrayIndex: 'clickTime_index',
                }
            },)
        if (start_date != null && end_date != null) {
            clickTimeFacet.push({
                $match: {
                    clickTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            })
        }
        clickTimeFacet.push(
            {
                $project: {
                    CPA: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adsTable", 0] },
                            },
                            "in": "$$tmp.CPA"
                        }
                    },
                }
            },
            {
                $group: {
                    _id: null,
                    row: { $sum: 1 },
                    count: { $sum: "$CPA" }
                }
            });

        //------------FACET USERADS AGE------------
        var userAds_Age_Facet = [];
        var andMatchuserAds_Age_Facet = [];
        andMatchuserAds_Age_Facet.push({ adsID: new mongoose.Types.ObjectId(adsId) });
        if (start_date != null && end_date != null) {
            andMatchuserAds_Age_Facet.push({
                viewTime: {
                    $elemMatch: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        userAds_Age_Facet.push(
            {
                $match: {
                    $and: andMatchuserAds_Age_Facet
                }
            },
            {
                $lookup: {
                    from: 'userbasics',
                    as: 'userbasics_data',
                    let: {
                        local_id: "$userID"
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
                                _id: 1,
                                email: 1,
                                fullName: 1,
                                gender: {
                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $or: [
                                                        { $eq: ["$gender", "Male"] },
                                                        { $eq: ["$gender", "Laki-laki"] },
                                                        { $eq: ["$gender", "MALE"] }
                                                    ]
                                                }, then: "Laki-laki"
                                            },
                                            {
                                                case: {
                                                    $or: [
                                                        { $eq: ["$gender", " Perempuan"] },
                                                        { $eq: ["$gender", "Perempuan"] },
                                                        { $eq: ["$gender", "PEREMPUAN"] },
                                                        { $eq: ["$gender", "FEMALE"] },
                                                        { $eq: ["$gender", " FEMALE"] }
                                                    ]
                                                }, then: "Perempuan"
                                            }
                                        ],
                                        "default": "Lainnya"
                                    }
                                },
                                age: {
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
                                ageQualication: {
                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $lt: [{
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
                                                    }, 14]
                                                },
                                                then: "< 14 Tahun"
                                            },
                                            {
                                                case: {
                                                    $and: [{
                                                        $gte: [{
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
                                                        }, 14]
                                                    }, {
                                                        $lte: [{
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
                                                        }, 28]
                                                    }]
                                                },
                                                then: "14 - 28 Tahun"
                                            },
                                            {
                                                case: {
                                                    $and: [{
                                                        $gte: [{
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
                                                        }, 29]
                                                    }, {
                                                        $lte: [{
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
                                                        }, 43]
                                                    }]
                                                },
                                                then: "29 - 43 Tahun"
                                            },
                                            {
                                                case: {
                                                    $gt: [{
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
                                                    }, 43]
                                                },
                                                then: "> 43 Tahun"
                                            },
                                        ],
                                        "default": "Other"
                                    }
                                },
                                userInterests_array: {
                                    $map: {
                                        input: {
                                            $map: {
                                                input: "$userInterests",
                                                in: {
                                                    $arrayElemAt: [{ $objectToArray: "$$this" }, 1]
                                                },
                                            }
                                        },
                                        in: "$$this.v"
                                    }
                                },
                                states: 1,
                            }
                        },
                        {
                            $lookup: {
                                from: "interests_repo",
                                localField: "userInterests_array",
                                foreignField: "_id",
                                as: "interests"
                            }
                        },
                        {
                            $lookup: {
                                from: 'areas',
                                as: 'areas',
                                let: {
                                    local_id: "$states.$id"
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
                                ]
                            }
                        },
                    ],
                },
            },
            {
                $unwind:
                {
                    path: "$clickTime",
                    includeArrayIndex: 'clickTime_index',
                }
            },)
        if (start_date != null && end_date != null) {
            userAds_Age_Facet.push({
                $match: {
                    clickTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            })
        }
        userAds_Age_Facet.push(
            {
                $group: {
                    _id: "$userID",
                    user: { "$first": "$$ROOT" },
                },
            },
            {
                $project: {
                    _id: 1,
                    gender: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                            },
                            "in": "$$tmp.gender"
                        }
                    },
                    ageQualication: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                            },
                            "in": "$$tmp.ageQualication"
                        }
                    },
                    interest: {
                        $map: {
                            input: {
                                $map: {
                                    input: {
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                                            },
                                            "in": "$$tmp.interests"
                                        }
                                    },
                                    in: {
                                        $arrayElemAt: [{ $objectToArray: "$$this" }, 1]
                                    },
                                }
                            },
                            in: "$$this.v"
                        }
                    },
                    areas: {
                        $let: {
                            "vars": {
                                userauths: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                                            },
                                            "in": "$$tmp.areas"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$userauths.stateName"
                        }
                    },
                }
            },
            {
                $group: {
                    _id: "$ageQualication",
                    ageCount: { "$sum": 1 }
                },
            });

        //------------FACET USERADS GENDER------------
        var userAds_Gender_Facet = [];
        var andMatchuserAds_Gender_Facet = [];
        andMatchuserAds_Gender_Facet.push({ adsID: new mongoose.Types.ObjectId(adsId) });
        if (start_date != null && end_date != null) {
            andMatchuserAds_Gender_Facet.push({
                viewTime: {
                    $elemMatch: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        userAds_Gender_Facet.push(
            {
                $match: {
                    $and: andMatchuserAds_Gender_Facet
                }
            },
            {
                $lookup: {
                    from: 'userbasics',
                    as: 'userbasics_data',
                    let: {
                        local_id: "$userID"
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
                                _id: 1,
                                email: 1,
                                fullName: 1,
                                gender: {
                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $or: [
                                                        { $eq: ["$gender", "Male"] },
                                                        { $eq: ["$gender", "Laki-laki"] },
                                                        { $eq: ["$gender", "MALE"] }
                                                    ]
                                                }, then: "Laki-laki"
                                            },
                                            {
                                                case: {
                                                    $or: [
                                                        { $eq: ["$gender", " Perempuan"] },
                                                        { $eq: ["$gender", "Perempuan"] },
                                                        { $eq: ["$gender", "PEREMPUAN"] },
                                                        { $eq: ["$gender", "FEMALE"] },
                                                        { $eq: ["$gender", " FEMALE"] }
                                                    ]
                                                }, then: "Perempuan"
                                            }
                                        ],
                                        "default": "Lainnya"
                                    }
                                },
                                age: {
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
                                ageQualication: {
                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $lt: [{
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
                                                    }, 14]
                                                },
                                                then: "< 14 Tahun"
                                            },
                                            {
                                                case: {
                                                    $and: [{
                                                        $gte: [{
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
                                                        }, 14]
                                                    }, {
                                                        $lte: [{
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
                                                        }, 28]
                                                    }]
                                                },
                                                then: "14 - 28 Tahun"
                                            },
                                            {
                                                case: {
                                                    $and: [{
                                                        $gte: [{
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
                                                        }, 29]
                                                    }, {
                                                        $lte: [{
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
                                                        }, 43]
                                                    }]
                                                },
                                                then: "29 - 43 Tahun"
                                            },
                                            {
                                                case: {
                                                    $gt: [{
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
                                                    }, 43]
                                                },
                                                then: "> 43 Tahun"
                                            },
                                        ],
                                        "default": "Other"
                                    }
                                },
                                userInterests_array: {
                                    $map: {
                                        input: {
                                            $map: {
                                                input: "$userInterests",
                                                in: {
                                                    $arrayElemAt: [{ $objectToArray: "$$this" }, 1]
                                                },
                                            }
                                        },
                                        in: "$$this.v"
                                    }
                                },
                                states: 1,
                            }
                        },
                        {
                            $lookup: {
                                from: "interests_repo",
                                localField: "userInterests_array",
                                foreignField: "_id",
                                as: "interests"
                            }
                        },
                        {
                            $lookup: {
                                from: 'areas',
                                as: 'areas',
                                let: {
                                    local_id: "$states.$id"
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
                                ]
                            }
                        },
                    ],
                },
            },
            {
                $unwind:
                {
                    path: "$clickTime",
                    includeArrayIndex: 'clickTime_index',
                }
            },)
        if (start_date != null && end_date != null) {
            userAds_Gender_Facet.push({
                $match: {
                    clickTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            })
        }
        userAds_Gender_Facet.push(
            {
                $group: {
                    _id: "$userID",
                    user: { "$first": "$$ROOT" },
                },
            },
            {
                $project: {
                    _id: 1,
                    gender: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                            },
                            "in": "$$tmp.gender"
                        }
                    },
                    ageQualication: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                            },
                            "in": "$$tmp.ageQualication"
                        }
                    },
                    interest: {
                        $map: {
                            input: {
                                $map: {
                                    input: {
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                                            },
                                            "in": "$$tmp.interests"
                                        }
                                    },
                                    in: {
                                        $arrayElemAt: [{ $objectToArray: "$$this" }, 1]
                                    },
                                }
                            },
                            in: "$$this.v"
                        }
                    },
                    areas: {
                        $let: {
                            "vars": {
                                userauths: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                                            },
                                            "in": "$$tmp.areas"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$userauths.stateName"
                        }
                    },
                }
            },
            {
                $group: {
                    _id: "$gender",
                    genderCount: { "$sum": 1 }
                },
            });

        //------------FACET USERADS AREA------------
        var userAds_Area_Facet = [];
        var andMatchuserAds_Area_Facet = [];
        andMatchuserAds_Area_Facet.push({ adsID: new mongoose.Types.ObjectId(adsId) });
        if (start_date != null && end_date != null) {
            andMatchuserAds_Area_Facet.push({
                viewTime: {
                    $elemMatch: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        userAds_Area_Facet.push(
            {
                $match: {
                    $and: andMatchuserAds_Area_Facet
                }
            },
            {
                $lookup: {
                    from: 'userbasics',
                    as: 'userbasics_data',
                    let: {
                        local_id: "$userID"
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
                                _id: 1,
                                email: 1,
                                fullName: 1,
                                gender: {
                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $or: [
                                                        { $eq: ["$gender", "Male"] },
                                                        { $eq: ["$gender", "Laki-laki"] },
                                                        { $eq: ["$gender", "MALE"] }
                                                    ]
                                                }, then: "Laki-laki"
                                            },
                                            {
                                                case: {
                                                    $or: [
                                                        { $eq: ["$gender", " Perempuan"] },
                                                        { $eq: ["$gender", "Perempuan"] },
                                                        { $eq: ["$gender", "PEREMPUAN"] },
                                                        { $eq: ["$gender", "FEMALE"] },
                                                        { $eq: ["$gender", " FEMALE"] }
                                                    ]
                                                }, then: "Perempuan"
                                            }
                                        ],
                                        "default": "Lainnya"
                                    }
                                },
                                age: {
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
                                ageQualication: {
                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $lt: [{
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
                                                    }, 14]
                                                },
                                                then: "< 14 Tahun"
                                            },
                                            {
                                                case: {
                                                    $and: [{
                                                        $gte: [{
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
                                                        }, 14]
                                                    }, {
                                                        $lte: [{
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
                                                        }, 28]
                                                    }]
                                                },
                                                then: "14 - 28 Tahun"
                                            },
                                            {
                                                case: {
                                                    $and: [{
                                                        $gte: [{
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
                                                        }, 29]
                                                    }, {
                                                        $lte: [{
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
                                                        }, 43]
                                                    }]
                                                },
                                                then: "29 - 43 Tahun"
                                            },
                                            {
                                                case: {
                                                    $gt: [{
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
                                                    }, 43]
                                                },
                                                then: "> 43 Tahun"
                                            },
                                        ],
                                        "default": "Other"
                                    }
                                },
                                userInterests_array: {
                                    $map: {
                                        input: {
                                            $map: {
                                                input: "$userInterests",
                                                in: {
                                                    $arrayElemAt: [{ $objectToArray: "$$this" }, 1]
                                                },
                                            }
                                        },
                                        in: "$$this.v"
                                    }
                                },
                                states: 1,
                            }
                        },
                        {
                            $lookup: {
                                from: "interests_repo",
                                localField: "userInterests_array",
                                foreignField: "_id",
                                as: "interests"
                            }
                        },
                        {
                            $lookup: {
                                from: 'areas',
                                as: 'areas',
                                let: {
                                    local_id: "$states.$id"
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
                                ]
                            }
                        },
                    ],
                },
            },
            {
                $unwind:
                {
                    path: "$clickTime",
                    includeArrayIndex: 'clickTime_index',
                }
            },)
        if (start_date != null && end_date != null) {
            userAds_Area_Facet.push({
                $match: {
                    clickTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            })
        }
        userAds_Area_Facet.push(
            {
                $group: {
                    _id: "$userID",
                    user: { "$first": "$$ROOT" },
                },
            },
            {
                $project: {
                    _id: 1,
                    gender: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                            },
                            "in": "$$tmp.gender"
                        }
                    },
                    ageQualication: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                            },
                            "in": "$$tmp.ageQualication"
                        }
                    },
                    interest: {
                        $map: {
                            input: {
                                $map: {
                                    input: {
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                                            },
                                            "in": "$$tmp.interests"
                                        }
                                    },
                                    in: {
                                        $arrayElemAt: [{ $objectToArray: "$$this" }, 1]
                                    },
                                }
                            },
                            in: "$$this.v"
                        }
                    },
                    areas: {
                        $let: {
                            "vars": {
                                userauths: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                                            },
                                            "in": "$$tmp.areas"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$userauths.stateName"
                        }
                    },
                }
            },
            {
                $group: {
                    _id: "$areas",
                    areasCount: { "$sum": 1 }
                },
            });

        //------------FACET USERADS INTEREST------------
        var userAds_Interest_Facet = [];
        var andMatchuserAds_Interest_Facet = [];
        andMatchuserAds_Interest_Facet.push({ adsID: new mongoose.Types.ObjectId(adsId) });
        if (start_date != null && end_date != null) {
            andMatchuserAds_Interest_Facet.push({
                viewTime: {
                    $elemMatch: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        userAds_Interest_Facet.push(
            {
                $match: {
                    $and: andMatchuserAds_Interest_Facet
                }
            },
            {
                $lookup: {
                    from: 'userbasics',
                    as: 'userbasics_data',
                    let: {
                        local_id: "$userID"
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
                                _id: 1,
                                email: 1,
                                fullName: 1,
                                gender: {
                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $or: [
                                                        { $eq: ["$gender", "Male"] },
                                                        { $eq: ["$gender", "Laki-laki"] },
                                                        { $eq: ["$gender", "MALE"] }
                                                    ]
                                                }, then: "Laki-laki"
                                            },
                                            {
                                                case: {
                                                    $or: [
                                                        { $eq: ["$gender", " Perempuan"] },
                                                        { $eq: ["$gender", "Perempuan"] },
                                                        { $eq: ["$gender", "PEREMPUAN"] },
                                                        { $eq: ["$gender", "FEMALE"] },
                                                        { $eq: ["$gender", " FEMALE"] }
                                                    ]
                                                }, then: "Perempuan"
                                            }
                                        ],
                                        "default": "Lainnya"
                                    }
                                },
                                age: {
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
                                ageQualication: {
                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $lt: [{
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
                                                    }, 14]
                                                },
                                                then: "< 14 Tahun"
                                            },
                                            {
                                                case: {
                                                    $and: [{
                                                        $gte: [{
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
                                                        }, 14]
                                                    }, {
                                                        $lte: [{
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
                                                        }, 28]
                                                    }]
                                                },
                                                then: "14 - 28 Tahun"
                                            },
                                            {
                                                case: {
                                                    $and: [{
                                                        $gte: [{
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
                                                        }, 29]
                                                    }, {
                                                        $lte: [{
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
                                                        }, 43]
                                                    }]
                                                },
                                                then: "29 - 43 Tahun"
                                            },
                                            {
                                                case: {
                                                    $gt: [{
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
                                                    }, 43]
                                                },
                                                then: "> 43 Tahun"
                                            },
                                        ],
                                        "default": "Other"
                                    }
                                },
                                userInterests_array: {
                                    $map: {
                                        input: {
                                            $map: {
                                                input: "$userInterests",
                                                in: {
                                                    $arrayElemAt: [{ $objectToArray: "$$this" }, 1]
                                                },
                                            }
                                        },
                                        in: "$$this.v"
                                    }
                                },
                                states: 1,
                            }
                        },
                        {
                            $lookup: {
                                from: "interests_repo",
                                localField: "userInterests_array",
                                foreignField: "_id",
                                as: "interests"
                            }
                        },
                        {
                            $lookup: {
                                from: 'areas',
                                as: 'areas',
                                let: {
                                    local_id: "$states.$id"
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
                                ]
                            }
                        },
                    ],
                },
            },
            {
                $unwind:
                {
                    path: "$clickTime",
                    includeArrayIndex: 'clickTime_index',
                }
            },)
        if (start_date != null && end_date != null) {
            userAds_Interest_Facet.push({
                $match: {
                    clickTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            })
        }
        userAds_Interest_Facet.push(
            {
                $group: {
                    _id: "$userID",
                    user: { "$first": "$$ROOT" },
                },
            },
            {
                $project: {
                    _id: 1,
                    gender: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                            },
                            "in": "$$tmp.gender"
                        }
                    },
                    ageQualication: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                            },
                            "in": "$$tmp.ageQualication"
                        }
                    },
                    interest: {
                        $map: {
                            input: {
                                $map: {
                                    input: {
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                                            },
                                            "in": "$$tmp.interests"
                                        }
                                    },
                                    in: {
                                        $arrayElemAt: [{ $objectToArray: "$$this" }, 1]
                                    },
                                }
                            },
                            in: "$$this.v"
                        }
                    },
                    areas: {
                        $let: {
                            "vars": {
                                userauths: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                                            },
                                            "in": "$$tmp.areas"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$userauths.stateName"
                        }
                    },
                }
            },
            {
                $unwind: "$interest"
            },
            {
                $group: {
                    _id: "$interest",
                    interestCount: { "$sum": 1 }
                },
            });

        //------------FACET USERADS------------
        var userAdsFacet = [];
        var andMatchuserAdsFacet = [];
        andMatchuserAdsFacet.push({ adsID: new mongoose.Types.ObjectId(adsId) });
        if (start_date != null && end_date != null) {
            andMatchuserAdsFacet.push({
                viewTime: {
                    $elemMatch: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        userAdsFacet.push(
            {
                $match: {
                    $and: andMatchuserAdsFacet
                }
            },
            {
                $lookup: {
                    from: 'userbasics',
                    as: 'userbasics_data',
                    let: {
                        local_id: "$userID"
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
                                _id: 1,
                                email: 1,
                                fullName: 1,
                                gender: {
                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $or: [
                                                        { $eq: ["$gender", "Male"] },
                                                        { $eq: ["$gender", "Laki-laki"] },
                                                        { $eq: ["$gender", "MALE"] }
                                                    ]
                                                }, then: "Laki-laki"
                                            },
                                            {
                                                case: {
                                                    $or: [
                                                        { $eq: ["$gender", " Perempuan"] },
                                                        { $eq: ["$gender", "Perempuan"] },
                                                        { $eq: ["$gender", "PEREMPUAN"] },
                                                        { $eq: ["$gender", "FEMALE"] },
                                                        { $eq: ["$gender", " FEMALE"] }
                                                    ]
                                                }, then: "Perempuan"
                                            }
                                        ],
                                        "default": "Lainnya"
                                    }
                                },
                                age: {
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
                                ageQualication: {
                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $lt: [{
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
                                                    }, 14]
                                                },
                                                then: "< 14 Tahun"
                                            },
                                            {
                                                case: {
                                                    $and: [{
                                                        $gte: [{
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
                                                        }, 14]
                                                    }, {
                                                        $lte: [{
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
                                                        }, 28]
                                                    }]
                                                },
                                                then: "14 - 28 Tahun"
                                            },
                                            {
                                                case: {
                                                    $and: [{
                                                        $gte: [{
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
                                                        }, 29]
                                                    }, {
                                                        $lte: [{
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
                                                        }, 43]
                                                    }]
                                                },
                                                then: "29 - 43 Tahun"
                                            },
                                            {
                                                case: {
                                                    $gt: [{
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
                                                    }, 43]
                                                },
                                                then: "> 43 Tahun"
                                            },
                                        ],
                                        "default": "Other"
                                    }
                                },
                                userInterests_array: {
                                    $map: {
                                        input: {
                                            $map: {
                                                input: "$userInterests",
                                                in: {
                                                    $arrayElemAt: [{ $objectToArray: "$$this" }, 1]
                                                },
                                            }
                                        },
                                        in: "$$this.v"
                                    }
                                },
                                states: 1,
                            }
                        },
                        {
                            $lookup: {
                                from: "interests_repo",
                                localField: "userInterests_array",
                                foreignField: "_id",
                                as: "interests"
                            }
                        },
                        {
                            $lookup: {
                                from: 'areas',
                                as: 'areas',
                                let: {
                                    local_id: "$states.$id"
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
                                ]
                            }
                        },
                    ],
                },
            },
            {
                $unwind:
                {
                    path: "$clickTime",
                    includeArrayIndex: 'clickTime_index',
                }
            },)
        if (start_date != null && end_date != null) {
            userAdsFacet.push({
                $match: {
                    clickTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            })
        }
        userAdsFacet.push(
            {
                $group: {
                    _id: "$userID",
                    user: { "$first": "$$ROOT" },
                },
            },
            {
                $project: {
                    _id: 1,
                    gender: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                            },
                            "in": "$$tmp.gender"
                        }
                    },
                    ageQualication: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                            },
                            "in": "$$tmp.ageQualication"
                        }
                    },
                    interest: {
                        $map: {
                            input: {
                                $map: {
                                    input: {
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                                            },
                                            "in": "$$tmp.interests"
                                        }
                                    },
                                    in: {
                                        $arrayElemAt: [{ $objectToArray: "$$this" }, 1]
                                    },
                                }
                            },
                            in: "$$this.v"
                        }
                    },
                    areas: {
                        $let: {
                            "vars": {
                                userauths: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$user.userbasics_data", 0] },
                                            },
                                            "in": "$$tmp.areas"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$userauths.stateName"
                        }
                    },
                }
            },
            {
                $group: {
                    _id: null,
                    adsViewCount: { "$sum": 1 }
                },
            });

        let query = await this.userAdsModel.aggregate([
            {
                $addFields: {
                    dateStart: start_date,
                    dateEnd: end_date,
                    paramadsId: new mongoose.Types.ObjectId(adsId)
                }
            },
            {
                $match:
                {
                    adsID: new mongoose.Types.ObjectId(adsId)
                }
            },
            {
                $lookup:
                {
                    from: "ads",
                    as: "ads_data",
                    let:
                    {
                        adsID: "$paramadsId",
                        dateStart_: "$dateStart",
                        dateEnd_: "$dateEnd"
                    },
                    pipeline:
                    [
                        {
                            $match:
                            {
                                $expr: {
                                    $and: andMatch
                                }
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
                    ]
                }
            },
            {
                $facet:
                {
                    adsDetail: [
                        {
                            $group: {
                                _id: "$ads_data",
                                userIDCount: { "$sum": 1 }
                            },
                        },
                        {
                            $project: {
                                _id: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp._id"
                                    }
                                },
                                campaignId: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.campaignId"
                                    }
                                },
                                name: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.name"
                                    }
                                }, 
                                description: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.description"
                                    }
                                },
                                typeAdsID: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.typeAdsID"
                                    }
                                },
                                typeAdsIDName: {
                                    $let: {
                                        "vars": {
                                            adstypes: {
                                                "$arrayElemAt": [{
                                                    "$let": {
                                                        "vars": {
                                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                                        },
                                                        "in": "$$tmp.adstypes_data"
                                                    }
                                                }, 0]
                                            }
                                        },
                                        "in": "$$adstypes.nameType"
                                    }
                                },
                                liveAt: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.liveAt"
                                    }
                                },
                                liveEnd: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.liveEnd"
                                    }
                                }, 
                                urlLink: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.urlLink"
                                    }
                                },
                                tayang: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.tayang"
                                    }
                                },
                                credit: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.credit"
                                    }
                                },
                                objectivitasId: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.adsObjectivitasId"
                                    }
                                },
                                objectivitasIdNameId: {
                                    $let: {
                                        "vars": {
                                            adsobjectivitas: {
                                                "$arrayElemAt": [{
                                                    "$let": {
                                                        "vars": {
                                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                                        },
                                                        "in": "$$tmp.adsobjectivitas_data"
                                                    }
                                                }, 0]
                                            }
                                        },
                                        "in": "$$adsobjectivitas.name_id"
                                    }
                                },
                                objectivitasIdNameEn: {
                                    $let: {
                                        "vars": {
                                            adsobjectivitas: {
                                                "$arrayElemAt": [{
                                                    "$let": {
                                                        "vars": {
                                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                                        },
                                                        "in": "$$tmp.adsobjectivitas_data"
                                                    }
                                                }, 0]
                                            }
                                        },
                                        "in": "$$adsobjectivitas.name_en"
                                    }
                                },
                                audiensFrekuensi: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.audiensFrekuensi"
                                    }
                                },
                                status: {
                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: [{
                                                        "$let": {
                                                            "vars": {
                                                                "tmp": { "$arrayElemAt": ["$_id", 0] },
                                                            },
                                                            "in": "$$tmp.status"
                                                        }
                                                    }, 'DRAFT'] },
                                                then: 'DRAFT',
                                            },
                                            {
                                                case: {
                                                    $or: [{
                                                        $eq: [{
                                                            "$let": {
                                                                "vars": {
                                                                    "tmp": { "$arrayElemAt": ["$_id", 0] },
                                                                },
                                                                "in": "$$tmp.status"
                                                            }
                                                        }, 'FINISH']
                                                    }, {
                                                        $eq: [{
                                                            "$let": {
                                                                "vars": {
                                                                    "tmp": { "$arrayElemAt": ["$_id", 0] },
                                                                },
                                                                "in": "$$tmp.status"
                                                            }
                                                        }, 'IN_ACTIVE'] }, { $eq: ['$status', 'REPORTED'] }] },
                                                then: 'IN_ACTIVE',
                                            },
                                            {
                                                case: {
                                                    $or: [{
                                                        $eq: [{
                                                            "$let": {
                                                                "vars": {
                                                                    "tmp": { "$arrayElemAt": ["$_id", 0] },
                                                                },
                                                                "in": "$$tmp.status"
                                                            }
                                                        }, 'APPROVE'] }, { $eq: ['$status', 'ACTIVE'] }] },
                                                then: 'ACTIVE',
                                            },
                                            {
                                                case: {
                                                    $eq: [{
                                                        "$let": {
                                                            "vars": {
                                                                "tmp": { "$arrayElemAt": ["$_id", 0] },
                                                            },
                                                            "in": "$$tmp.status"
                                                        }
                                                    }, 'UNDER_REVIEW'] },
                                                then: 'UNDER_REVIEW',
                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                }, 
                                dayAds: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$_id", 0] },
                                        },
                                        "in": "$$tmp.dayAds"
                                    }
                                },
                            }
                        }
                    ],
                    viewed: viewedFacet,
                    reach: reachFacet,
                    impresi: impresiFacet,
                    CTA: CTAFacet,
                    CTACount: CTACountFacet,
                    viewTime: viewTimeFacet,
                    clickTime: clickTimeFacet,
                    userAdsAge: userAds_Age_Facet,
                    userAdsGender: userAds_Gender_Facet,
                    userAdsArea: userAds_Area_Facet,
                    userAdsInterest: userAds_Interest_Facet,
                    userAds: userAdsFacet,
                }
            },
            {
                $project: {
                    adsDetail: { "$arrayElemAt": ["$adsDetail", 0] },
                    summary: {
                        Totalimpresi: {
                            "$let": {
                                "vars": {
                                    "tmp": { "$arrayElemAt": ["$viewed", 0] },
                                },
                                "in": "$$tmp.impresi"
                            }
                        },
                        Totalreach: {
                            "$let": {
                                "vars": {
                                    "tmp": { "$arrayElemAt": ["$viewed", 0] },
                                },
                                "in": "$$tmp.reach"
                            }
                        },
                        TotalCTA: {
                            "$let": {
                                "vars": {
                                    "tmp": { "$arrayElemAt": ["$CTACount", 0] },
                                },
                                "in": "$$tmp.CTACount"
                            }
                        },
                        CTR: {
                            "$concat": [{
                                "$toString": {
                                    "$multiply": [{
                                        "$divide": [{
                                            "$let": {
                                                "vars": {
                                                    "tmp": { "$arrayElemAt": ["$CTACount", 0] },
                                                },
                                                "in": "$$tmp.CTACount"
                                            }
                                        }, {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": { "$arrayElemAt": ["$viewed", 0] },
                                                    },
                                                    "in": "$$tmp.reach"
                                                }
                                            }]
                                    }, 100]
                                }
                            }, "", "%"]
                        },
                        impresi: "$impresi",
                        reach: "$reach",
                        CTA: "$CTA",
                    },
                    saldoKredit: {
                        $sum: [
                            {
                                $convert: {
                                    input: { "$arrayElemAt": ['$viewTime.count', 0] },
                                    to: "int",
                                    onError: 0,
                                    onNull: 0
                                }
                            },
                            {
                                $convert: {
                                    input: { "$arrayElemAt": ['$clickTime.count', 0] },
                                    to: "int",
                                    onError: 0,
                                    onNull: 0
                                }
                            }
                        ]
                    },
                    userAds: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userAds", 0] },
                            },
                            "in": "$$tmp.adsViewCount"
                        }
                    },
                    userAdsAge: {
                        "$map": {
                            "input": { "$range": [0, { "$size": "$userAdsAge" }] },
                            "in": {
                                "name": {
                                    "$arrayElemAt": ["$userAdsAge._id", "$$this"]
                                },
                                "count": {
                                    "$arrayElemAt": ["$userAdsAge.ageCount", "$$this"]
                                },
                                "persentase": {
                                    "$multiply": [{
                                        "$divide": [{
                                            "$arrayElemAt": ["$userAdsAge.ageCount", "$$this"]
                                        }, {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": { "$arrayElemAt": ["$userAds", 0] },
                                                    },
                                                    "in": "$$tmp.adsViewCount"
                                                }
                                            }]
                                    }, 100]
                                },
                                "persentaseText": {
                                    "$concat": [{
                                        "$toString": {
                                            "$multiply": [{
                                                "$divide": [{
                                                    "$arrayElemAt": ["$userAdsAge.ageCount", "$$this"]
                                                }, {
                                                        "$let": {
                                                            "vars": {
                                                                "tmp": { "$arrayElemAt": ["$userAds", 0] },
                                                            },
                                                            "in": "$$tmp.adsViewCount"
                                                        }
                                                    }]
                                            }, 100]
                                        }
                                    }, "", "%"]
                                }
                            }
                        }
                    },
                    userAdsGender: {
                        "$map": {
                            "input": { "$range": [0, { "$size": "$userAdsGender" }] },
                            "in": {
                                "name": {
                                    "$arrayElemAt": ["$userAdsGender._id", "$$this"]
                                },
                                "count": {
                                    "$arrayElemAt": ["$userAdsGender.genderCount", "$$this"]
                                },
                                "persentase": {
                                    "$multiply": [{
                                        "$divide": [{
                                            "$arrayElemAt": ["$userAdsGender.genderCount", "$$this"]
                                        }, {
                                            "$let": {
                                                "vars": {
                                                    "tmp": { "$arrayElemAt": ["$userAds", 0] },
                                                },
                                                "in": "$$tmp.adsViewCount"
                                            }
                                        }]
                                    }, 100]
                                },
                                "persentaseText": {
                                    "$concat": [{
                                        "$toString": {
                                            "$multiply": [{
                                                "$divide": [{
                                                    "$arrayElemAt": ["$userAdsGender.genderCount", "$$this"]
                                                }, {
                                                    "$let": {
                                                        "vars": {
                                                            "tmp": { "$arrayElemAt": ["$userAds", 0] },
                                                        },
                                                        "in": "$$tmp.adsViewCount"
                                                    }
                                                }]
                                            }, 100]
                                        }
                                    }, "", "%"]
                                }
                            }
                        }
                    },
                    userAdsArea: {
                        "$map": {
                            "input": { "$range": [0, { "$size": "$userAdsArea" }] },
                            "in": {
                                "name": {
                                    "$arrayElemAt": ["$userAdsArea._id", "$$this"]
                                },
                                "count": {
                                    "$arrayElemAt": ["$userAdsArea.areasCount", "$$this"]
                                },
                                "persentase": {
                                    "$multiply": [{
                                        "$divide": [{
                                            "$arrayElemAt": ["$userAdsArea.areasCount", "$$this"]
                                        }, {
                                            "$let": {
                                                "vars": {
                                                    "tmp": { "$arrayElemAt": ["$userAds", 0] },
                                                },
                                                "in": "$$tmp.adsViewCount"
                                            }
                                        }]
                                    }, 100]
                                },
                                "persentaseText": {
                                    "$concat": [{
                                        "$toString": {
                                            "$multiply": [{
                                                "$divide": [{
                                                    "$arrayElemAt": ["$userAdsArea.areasCount", "$$this"]
                                                }, {
                                                    "$let": {
                                                        "vars": {
                                                            "tmp": { "$arrayElemAt": ["$userAds", 0] },
                                                        },
                                                        "in": "$$tmp.adsViewCount"
                                                    }
                                                }]
                                            }, 100]
                                        }
                                    }, "", "%"]
                                }
                            }
                        }
                    },
                    userAdsInterest: {
                        "$map": {
                            "input": { "$range": [0, { "$size": "$userAdsInterest" }] },
                            "in": {
                                "name": {
                                    "$arrayElemAt": ["$userAdsInterest._id", "$$this"]
                                },
                                "count": {
                                    "$arrayElemAt": ["$userAdsInterest.interestCount", "$$this"]
                                },
                                "persentase": {
                                    "$multiply": [{
                                        "$divide": [{
                                            "$arrayElemAt": ["$userAdsInterest.interestCount", "$$this"]
                                        }, {
                                            "$let": {
                                                "vars": {
                                                    "tmp": { "$arrayElemAt": ["$userAds", 0] },
                                                },
                                                "in": "$$tmp.adsViewCount"
                                            }
                                        }]
                                    }, 100]
                                },
                                "persentaseText": {
                                    "$concat": [{
                                        "$toString": {
                                            "$multiply": [{
                                                "$divide": [{
                                                    "$arrayElemAt": ["$userAdsInterest.interestCount", "$$this"]
                                                }, {
                                                    "$let": {
                                                        "vars": {
                                                            "tmp": { "$arrayElemAt": ["$userAds", 0] },
                                                        },
                                                        "in": "$$tmp.adsViewCount"
                                                    }
                                                }]
                                            }, 100]
                                        }
                                    }, "", "%"]
                                }
                            }
                        }
                    },
                    // userAdsGender_: "$userAdsGender",
                    // userAdsArea_: "$userAdsArea",
                    // userAdsInterest_: "$userAdsInterest"
                }, 
            },
        ]);
        return query;
    }

}
