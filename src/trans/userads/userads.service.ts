import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { Model, Types } from 'mongoose';
import { CreateUserAdsDto } from './dto/create-userads.dto';
import { UserAds, UserAdsDocument } from './schemas/userads.schema';
import { MediaprofilepictsService } from '../../content/mediaprofilepicts/mediaprofilepicts.service';
@Injectable()
export class UserAdsService {
    constructor(@InjectModel(UserAds.name, 'SERVER_FULL')
    private readonly userAdsModel: Model<UserAdsDocument>, private readonly mediaprofilepictsService: MediaprofilepictsService,
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

    async findAdsIDUserID(userID: string, adsID: string): Promise<UserAds>{
        return this.userAdsModel.findOne({ adsID: new ObjectId(adsID), userID: new ObjectId(userID) }).exec();
    }

    async findUserAdsRewars(userID: string, adsID: string, AdsSkip: number): Promise<UserAds> {
        return this.userAdsModel.findOne({ adsID: new ObjectId(adsID), userID: new ObjectId(userID), $or: [{ statusClick: true }, { statusView: true }], timeViewSecond: { $gt: AdsSkip } }).exec();
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
    async update(
        adsID: string,
        createUserAdsDto: CreateUserAdsDto,
    ): Promise<UserAds> {
        let data = await this.userAdsModel.findByIdAndUpdate(
            adsID,
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

    async updateUpdateAt(_id: string,datetime: string) {
        return await this.userAdsModel.updateOne({ _id: new ObjectId(_id) }, { $push: { updateAt: datetime } }).exec();
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
        console.log(util.inspect(pipeline, false, null, true /* enable colors */))

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
        pipeline.push({
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

    async getAdsbygender(startdate: string, enddate: string) {
        var before = new Date(startdate).toISOString().split("T")[0];
        var input = new Date(enddate);
        input.setDate(input.getDate() + 1);
        var today = new Date(input).toISOString().split("T")[0];

        var query = await this.userAdsModel.aggregate([
            {
                "$match":
                {
                    createdAt:
                    {
                        "$gte":before,
                        "$lte":today
                    },
                    "$or":
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
                            "$expr":
                            {
                                "$eq":
                                [
                                    "$statusView", true
                                ]
                            }
                        },
                    ]
                }
            },
            {
                "$project":
                {
                    _id:1,
                    userID:1
                }
            },
            {
                "$group":
                {
                    _id:"$userID"
                }
            },
            {
                "$lookup":
                {
                    "from": "userbasics",
                    "as": "recorduser",
                    "let": {
                        "userbasic_fk": "$_id"
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
                                        "$_id",
                                        "$$userbasic_fk"
                                    ]
                                },
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
                    recorduser:1,
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
                                _id:
                                {
                                    "$arrayElemAt":
                                    [
                                        "$recorduser.gender", 0
                                    ]
                                },
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
                                _id:
                                {
                                    "$arrayElemAt":
                                    [
                                        "$recorduser.lokasi", 0
                                    ]
                                },
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
                                // total:1
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
}
