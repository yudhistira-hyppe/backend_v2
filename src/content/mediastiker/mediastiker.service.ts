import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Mediastiker, MediastikerDocument } from './schemas/mediastiker.schema';
import { first, pipe } from 'rxjs';

@Injectable()
export class MediastikerService {

    constructor(
        @InjectModel(Mediastiker.name, 'SERVER_FULL')
        private readonly MediastikerModel: Model<MediastikerDocument>,
    ) { }

    async create(Mediastiker_: Mediastiker): Promise<Mediastiker> {
        const _Mediastiker_ = await this.MediastikerModel.create(Mediastiker_);
        return _Mediastiker_;
    }

    async findOne(id: string): Promise<Mediastiker> {
        return this.MediastikerModel.findOne({ _id: new Types.ObjectId(id) }).exec();
    }
    async findByname(name: string): Promise<Mediastiker> {
        return this.MediastikerModel.findOne({ name: name }).exec();
    }
    async findByIndex(index: number, type: string, kategori: string): Promise<Mediastiker> {
        return this.MediastikerModel.findOne({ index: index, type: type, kategori: kategori }).exec();
    }
    async findByKategori(target: string): Promise<Mediastiker[]> {
        return this.MediastikerModel.aggregate([
            {
                "$match":
                {
                    "$and":
                        [
                            {
                                kategori: target
                            },
                            {
                                isDelete: false
                            }
                        ]
                }
            },
            {
                "$sort":
                {
                    index: 1
                }
            }
        ]);
    }
    async findOne2(id: string) {
        var mongo = require('mongoose');
        var konvertid = mongo.Types.ObjectId(id);

        var pipeline = [];
        pipeline.push({
            "$match":
            {
                _id: konvertid
            }
        },
        );

        var query = await this.MediastikerModel.aggregate(pipeline);

        return query[0];
    }

    async find(): Promise<Mediastiker[]> {
        return this.MediastikerModel.find().exec();
    }

    async update(id: string, Mediastiker_: Mediastiker): Promise<Mediastiker> {
        let data = await this.MediastikerModel.findByIdAndUpdate(id, Mediastiker_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }

    async delete(id: string) {
        const data = await this.MediastikerModel.findByIdAndRemove({ _id: new Types.ObjectId(id) }).exec();
        return data;
    }
    async updateNonactive(id: string): Promise<Object> {
        let data = await this.MediastikerModel.updateOne({ "_id": id },
            {
                $set: {
                    "isDelete": true
                }
            });
        return data;
    }

    async updateUsed(_id: string) {
        this.MediastikerModel.updateOne(
            {
                _id: new Types.ObjectId(_id),
            },
            { $inc: { used: 1 } },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }

    async updatedatabasedonkategori(targetcat: string, changecat: string, tipe: string) {
        let data = await this.MediastikerModel.updateMany({ kategori: targetcat, type: tipe, isDelete: false },
            {
                $set: {
                    "kategori": changecat
                }
            });
        return data;
    }
    async findByNourut(nourut: number, type: string, kategori: string) {
        var query = this.MediastikerModel.aggregate([
            {
                "$match":
                {
                    'index': { $gte: nourut }, 'type': type, 'kategori': kategori
                }
            },
            {
                $sort: { 'index': 1 }
            }
        ]);
        return query;
    }
    async findByTypekategori(type: string, kategori: string) {
        var query = this.MediastikerModel.aggregate([
            {
                "$match":
                {
                    'type': type, 'kategori': kategori
                }
            },
            {
                $sort: { 'index': -1 }
            }
        ]);
        return query;
    }
    async findByNourutLebihkecil(nourutStart: number, nourutEnd: number, type: string, kategori: string) {
        var query = this.MediastikerModel.aggregate([
            {
                "$match":
                {
                    'index': { $gte: nourutStart, $lte: nourutEnd }, 'type': type, 'kategori': kategori
                }
            },
            {
                $sort: { 'index': -1 }
            }

        ]);
        return query;
    }
    async findByNourutLebihbesar(nourutStart: number, nourutEnd: number, type: string, kategori: string) {
        var query = this.MediastikerModel.aggregate([
            {
                "$match":
                {
                    'index': { $lte: nourutStart, $gte: nourutEnd }, 'type': type, 'kategori': kategori

                }
            },
            {
                $sort: { 'index': 1 }
            }

        ]);
        return query;
    }
    async updateIndex(id: string, index: number, updatedAt: string) {
        let data = await this.MediastikerModel.updateOne({ "_id": new Types.ObjectId(id) },
            { $set: { "index": index, "updatedAt": updatedAt, } });
        return data;
    }

    async trend() {
        var data = await this.MediastikerModel.aggregate([
            {
                "$facet":
                {
                    "stiker":
                        [
                            {
                                "$match":
                                {
                                    "$and":
                                        [
                                            {
                                                type: "STICKER"
                                            },
                                            {
                                                status: true
                                            },
                                            {
                                                isDelete: false
                                            },
                                            {
                                                used:
                                                {
                                                    "$ne": 0
                                                }
                                            },
                                        ]
                                }
                            },
                            {
                                "$sort":
                                {
                                    used: -1
                                }
                            },
                            {
                                "$limit": 5
                            }
                        ],
                    "gif":
                        [
                            {
                                "$match":
                                {
                                    "$and":
                                        [
                                            {
                                                type: "GIF"
                                            },
                                            {
                                                status: true
                                            },
                                            {
                                                isDelete: false
                                            },
                                            {
                                                used:
                                                {
                                                    "$ne": 0
                                                }
                                            },
                                        ]
                                }
                            },
                            {
                                "$sort":
                                {
                                    used: -1
                                }
                            },
                            {
                                "$limit": 5
                            }
                        ],
                    "emoji":
                        [
                            {
                                "$match":
                                {
                                    "$and":
                                        [
                                            {
                                                type: "EMOJI"
                                            },
                                            {
                                                status: true
                                            },
                                            {
                                                isDelete: false
                                            },
                                            {
                                                used:
                                                {
                                                    "$ne": 0
                                                }
                                            },
                                        ]
                                }
                            },
                            {
                                "$sort":
                                {
                                    used: -1
                                }
                            },
                            {
                                "$limit": 5
                            }
                        ],
                }
            }
        ]);

        return data;
    }

    async listing(setname: string, settipesticker: string, startdate: string, enddate: string, startused: number, endused: number, listkategori: any[], liststatus: any[], sorting: string, page: number, limit: number) {
        var pipeline = [];

        pipeline.push(
            {
                "$match":
                {
                    "$and":
                        [
                            {
                                "type": settipesticker
                            },
                            {
                                "isDelete": false
                            },
                        ]
                }
            }
        )

        var firstmatch = [];
        if (setname != null) {
            firstmatch.push({
                name:
                {
                    "$regex": setname,
                    "$options": "i"
                }
            })
        }

        if (startdate != null) {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));
            var dateend = currentdate.toISOString();

            firstmatch.push(
                {
                    "createdAt":
                    {
                        "$gte": startdate
                    }
                },
                {
                    "createdAt":
                    {
                        "$lte": dateend
                    }
                },
            );
        }

        if (startused != null) {
            firstmatch.push(
                {
                    "used":
                    {
                        "$gte": startused
                    }
                },
                {
                    "used":
                    {
                        "$lte": endused
                    }
                },
            )
        }

        if (listkategori != null && settipesticker != 'GIF') {
            firstmatch.push(
                {
                    "kategori":
                    {
                        "$in": listkategori
                    }
                }
            )
        }

        if (liststatus != null) {
            firstmatch.push(
                {
                    "status":
                    {
                        "$in": liststatus
                    }
                }
            );
        }

        if (firstmatch.length != 0) {
            pipeline.push(
                {
                    "$match":
                    {
                        "$and": firstmatch
                    }
                }
            )
        }

        if (sorting != null) {
            if (sorting == "name+") {
                pipeline.push({
                    "$sort":
                    {
                        name: 1
                    }
                })
            }
            else if (sorting == "name-") {
                pipeline.push({
                    "$sort":
                    {
                        name: -1
                    }
                })
            }
            else if (sorting == "createdAt+") {
                pipeline.push({
                    "$sort":
                    {
                        createdAt: 1
                    }
                })
            }
            else if (sorting == "createdAt-") {
                pipeline.push({
                    "$sort":
                    {
                        createdAt: -1
                    }
                })
            }
            else {
                pipeline.push({
                    "$sort":
                    {
                        used: -1
                    }
                })
            }
        }

        if (page > 0) {
            pipeline.push({
                "$skip": limit * page
            });
        }

        if (limit > 0) {
            pipeline.push({
                "$limit": limit
            });
        }

        // console.log(JSON.stringify(pipeline));

        var data = await this.MediastikerModel.aggregate(pipeline);
        return data;
    }

    async stickerchartbyId(id:string)
    {
        var mongo = require('mongoose');
        var konvertid = mongo.Types.ObjectId(id);
        var data = await this.MediastikerModel.aggregate([
            {
                "$match":
                {
                    _id:konvertid
                }
            },
            {
                "$limit":1
            },
            {
                "$lookup":
                {
                    from:"posts",
                    as:"posts_data",
                    let:
                    {
                        stiker_id:"$_id"
                    },
                    pipeline:
                    [
                        {
                            "$unwind":
                            {
                                path:"$stiker"
                            }
                        },
                        {
                            "$match":
                            {
                                "$expr":
                                {
                                    "$eq":
                                    [
                                        "$stiker._id", "$$stiker_id"
                                    ]
                                }
                            }
                        },
                        {
                            "$group":
                            {
                                _id:"$email",
                                tipedata:
                                {
                                    "$push":
                                    {
                                        "postType":"$postType"
                                    }
                                }
                            }
                        },
                        {
                            "$lookup": 
                            {
                                from: 'userbasics',
                                localField: '_id',
                                foreignField: 'email',
                                as: 'basic_data',
                            }
                        },
                        {
                            "$unwind":
                            {
                                path:"$basic_data",
                                preserveNullAndEmptyArrays:true
                            }
                        },
                        {
                            "$project":
                            {
                                _id:1,
                                tipedata:1,
                                userInterests:"$basic_data.userInterests",
                                state: "$basic_data.states.$id",
                                age:
                                {
                                    "$switch": {
                                        "branches": [{
                                        "case": {
                                            "$and": [{
                                            "$gte": [{
                                                "$cond": {
                                                "if": {
                                                    "$and": ["$basic_data.dob", {
                                                    "$ne": ["$basic_data.dob", ""]
                                                    }]
                                                },
                                                "then": {
                                                    "$toInt": {
                                                    "$divide": [{
                                                        "$subtract": [new Date(), {
                                                        "$toDate": "$basic_data.dob"
                                                        }]
                                                    }, 31536000000]
                                                    }
                                                },
                                                "else": 0
                                                }
                                            }, 1]
                                            }, {
                                            "$lte": [{
                                                "$cond": {
                                                "if": {
                                                    "$and": ["$basic_data.dob", {
                                                    "$ne": ["$basic_data.dob", ""]
                                                    }]
                                                },
                                                "then": {
                                                    "$toInt": {
                                                    "$divide": [{
                                                        "$subtract": [new Date(), {
                                                        "$toDate": "$basic_data.dob"
                                                        }]
                                                    }, 31536000000]
                                                    }
                                                },
                                                "else": 0
                                                }
                                            }, 14]
                                            }]
                                        },
                                        "then": "< 14 Tahun"
                                        }, {
                                        "case": {
                                            "$and": [{
                                            "$gte": [{
                                                "$cond": {
                                                "if": {
                                                    "$and": ["$basic_data.dob", {
                                                    "$ne": ["$basic_data.dob", ""]
                                                    }]
                                                },
                                                "then": {
                                                    "$toInt": {
                                                    "$divide": [{
                                                        "$subtract": [new Date(), {
                                                        "$toDate": "$basic_data.dob"
                                                        }]
                                                    }, 31536000000]
                                                    }
                                                },
                                                "else": 0
                                                }
                                            }, 14]
                                            }, {
                                            "$lte": [{
                                                "$cond": {
                                                "if": {
                                                    "$and": ["$basic_data.dob", {
                                                    "$ne": ["$basic_data.dob", ""]
                                                    }]
                                                },
                                                "then": {
                                                    "$toInt": {
                                                    "$divide": [{
                                                        "$subtract": [new Date(), {
                                                        "$toDate": "$basic_data.dob"
                                                        }]
                                                    }, 31536000000]
                                                    }
                                                },
                                                "else": 0
                                                }
                                            }, 24]
                                            }]
                                        },
                                        "then": "14 - 24 Tahun"
                                        }, {
                                        "case": {
                                            "$and": [{
                                            "$gte": [{
                                                "$cond": {
                                                "if": {
                                                    "$and": ["$basic_data.dob", {
                                                    "$ne": ["$basic_data.dob", ""]
                                                    }]
                                                },
                                                "then": {
                                                    "$toInt": {
                                                    "$divide": [{
                                                        "$subtract": [new Date(), {
                                                        "$toDate": "$basic_data.dob"
                                                        }]
                                                    }, 31536000000]
                                                    }
                                                },
                                                "else": 0
                                                }
                                            }, 25]
                                            }, {
                                            "$lte": [{
                                                "$cond": {
                                                "if": {
                                                    "$and": ["$basic_data.dob", {
                                                    "$ne": ["$basic_data.dob", ""]
                                                    }]
                                                },
                                                "then": {
                                                    "$toInt": {
                                                    "$divide": [{
                                                        "$subtract": [new Date(), {
                                                        "$toDate": "$basic_data.dob"
                                                        }]
                                                    }, 31536000000]
                                                    }
                                                },
                                                "else": 0
                                                }
                                            }, 35]
                                            }]
                                        },
                                        "then": "24 - 35 Tahun"
                                        }, {
                                        "case": {
                                            "$and": [{
                                            "$gte": [{
                                                "$cond": {
                                                "if": {
                                                    "$and": ["$basic_data.dob", {
                                                    "$ne": ["$basic_data.dob", ""]
                                                    }]
                                                },
                                                "then": {
                                                    "$toInt": {
                                                    "$divide": [{
                                                        "$subtract": [new Date(), {
                                                        "$toDate": "$basic_data.dob"
                                                        }]
                                                    }, 31536000000]
                                                    }
                                                },
                                                "else": 0
                                                }
                                            }, 35]
                                            }, {
                                            "$lte": [{
                                                "$cond": {
                                                "if": {
                                                    "$and": ["$basic_data.dob", {
                                                    "$ne": ["$basic_data.dob", ""]
                                                    }]
                                                },
                                                "then": {
                                                    "$toInt": {
                                                    "$divide": [{
                                                        "$subtract": [new Date(), {
                                                        "$toDate": "$basic_data.dob"
                                                        }]
                                                    }, 31536000000]
                                                    }
                                                },
                                                "else": 0
                                                }
                                            }, 44]
                                            }]
                                        },
                                        "then": "35 - 44 Tahun"
                                        }, {
                                        "case": {
                                            "$gt": [{
                                            "$cond": {
                                                "if": {
                                                "$and": ["$basic_data.dob", {
                                                    "$ne": ["$basic_data.dob", ""]
                                                }]
                                                },
                                                "then": {
                                                "$toInt": {
                                                    "$divide": [{
                                                    "$subtract": [new Date(), {
                                                        "$toDate": "$basic_data.dob"
                                                    }]
                                                    }, 31536000000]
                                                }
                                                },
                                                "else": 0
                                            }
                                            }, 43]
                                        },
                                        "then": "> 44 Tahun"
                                        }],
                                        "default": "OTHER"
                                    }
                                },
                                gender:
                                {
                                    "$switch": 
                                    {
                                        branches: 
                                        [
                                            {
                                                case: {
                                                $eq: ['$basic_data.gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',
                            
                                            },
                                            {
                                                case: {
                                                $eq: ['$basic_data.gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',
                            
                                            },
                                            {
                                                case: {
                                                $eq: ['$basic_data.gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',
                            
                                            },
                                            {
                                                case: {
                                                $eq: ['$basic_data.gender', 'Wanita']
                                                },
                                                then: 'FEMALE',
                            
                                            },
                                            {
                                                case: {
                                                $eq: ['$basic_data.gender', 'MALE']
                                                },
                                                then: 'MALE',
                            
                                            },
                                            {
                                                case: {
                                                $eq: ['$basic_data.gender', ' MALE']
                                                },
                                                then: 'MALE',
                            
                                            },
                                            {
                                                case: {
                                                $eq: ['$basic_data.gender', 'Laki-laki']
                                                },
                                                then: 'MALE',
                            
                                            },
                                            {
                                                case: {
                                                $eq: ['$basic_data.gender', 'Pria']
                                                },
                                                then: 'MALE',
                            
                                            },
                                        ],
                                        default: "OTHER",
                                    }
                                },
                            },
                        },
                        {
                            $lookup: 
                            {
                                from: 'areas',
                                localField: 'state',
                                foreignField: '_id',
                                as: 'state_data',
                            }
                        },
                        {
                            "$project":
                            {
                                _id:1,
                                tipedata:1,
                                totalpost:
                                {
                                    "$size":"$tipedata"
                                },
                                userInterests:1,
                                age: 1,
                                gender: 1,
                                total:1,
                                state:
                                {
                                    "$ifNull":
                                    [
                                        {
                                            "$arrayElemAt":
                                            [
                                                "$state_data.stateName", 0
                                            ]
                                        },
                                        "LAINNYA"
                                    ]
                                },
                            }
                        },
                        {
                            "$facet":
                            {
                                "usedbytype":
                                [
                                    {
                                        "$unwind":
                                        {
                                            path:"$tipedata",
                                            preserveNullAndEmptyArrays:true
                                        }
                                    },
                                    {
                                        "$group":
                                        {
                                            _id:"$tipedata.postType",
                                            total:
                                            {
                                                "$sum":1
                                            }
                                        }
                                    }
                                ],
                                "gender":
                                [
                                    {
                                        "$group":
                                        {
                                            _id:"$gender",
                                            total:
                                            {
                                                "$sum":"$totalpost"
                                            }
                                        }
                                    },
                                    {
                                        "$sort":
                                        {
                                            total:-1
                                        }
                                    }
                                ],
                                "age":
                                [
                                    {
                                        "$group":
                                        {
                                            _id:"$age",
                                            total:
                                            {
                                                "$sum":"$totalpost"
                                            }
                                        }
                                    },
                                    {
                                        "$sort":
                                        {
                                            total:-1
                                        }
                                    }
                                ],
                                "area":
                                [
                                    {
                                        "$group":
                                        {
                                            _id:"$state",
                                            total:
                                            {
                                                "$sum":"$totalpost"
                                            }
                                        }
                                    },
                                    {
                                        "$sort":
                                        {
                                            total:-1
                                        }
                                    }
                                ],
                                "interest":
                                [
                                    {
                                        "$unwind":
                                        {
                                            path:"$userInterests"
                                        }
                                    },
                                    {
                                        "$project":
                                        {
                                            interest:"$userInterests.$id"
                                        }
                                    },
                                    {
                                        "$group":
                                        {
                                            _id:"$interest"
                                        }
                                    },
                                    {
                                        $lookup: 
                                        {
                                            from: 'interests_repo',
                                            localField: '_id',
                                            foreignField: '_id',
                                            as: 'interest_data',
                                        }
                                    },
                                    {
                                        "$project":
                                        {
                                            _id:0,
                                            interests:
                                            {
                                                "$arrayElemAt":
                                                [
                                                    "$interest_data.interestName",0
                                                ]
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            },
            {
                "$lookup": 
                {
                    from: 'countStiker',
                    localField: '_id',
                    foreignField: 'stikerId',
                    as: 'count_data',
                }
            },
            {
                "$project":
                {
                    // used:
                    // {
                    //     "$arrayElemAt":
                    //     [
                    //         "$count_data.countused",0
                    //     ]
                    // },
                    search:
                    {
                        "$arrayElemAt":
                        [
                            "$count_data.countsearch",0
                        ]
                    },
                    used:
                    {
                        "$arrayElemAt":
                        [
                            "$posts_data.usedbytype",0
                        ]
                    },
                    gender:
                    {
                        "$arrayElemAt":
                        [
                            "$posts_data.gender",0
                        ]
                    },
                    age:
                    {
                        "$arrayElemAt":
                        [
                            "$posts_data.age",0
                        ]
                    },
                    area:
                    {
                        "$arrayElemAt":
                        [
                            "$posts_data.area",0
                        ]
                    },
                    interest:
                    {
                        "$arrayElemAt":
                        [
                            "$posts_data.interest",0
                        ]
                    },
                }
            }
        ]);
        
        return data[0];
    }

    async listingapp(keyword:string, sticker:string, page:number, limit:number)
    {
        var pipeline = [];
        pipeline.push(
            {
                "$match":
                {
                    "$and":
                    [
                        {
                            "type":sticker
                        },
                        {
                            "status":true
                        },
                        {
                            "isDelete":false
                        }
                    ]
                }
            },
            {
                "$lookup": 
                {
                    "from": "countStiker",
                    "localField": "_id",
                    "foreignField": "stikerId",
                    "as": "stiker_data"
                }
            },
            {
                "$lookup": 
                {
                    "from": "stickerCategory",
                    "as": "kategori_data",
                    "let":
                    {
                        kategori_id:"$kategori",
                        tipe_id:"$type"
                    },
                    "pipeline":
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
                                                "$name","$$kategori_id"
                                            ]
                                        }
                                    },
                                    {
                                        "$expr":
                                        {
                                            "$eq":
                                            [
                                                "$type","$$tipe_id"
                                            ]
                                        }
                                    },
                                    {
                                        active:true
                                    }
                                ]
                            }
                        }
                    ]
                }
            },
            {
                "$addFields": 
                {
                    "countused": 
                    {
                        "$arrayElemAt": 
                        [
                            "$stiker_data.countused",
                            0
                        ]
                    },
                    "countsearch": 
                    {
                        "$arrayElemAt": 
                        [
                            "$stiker_data.countsearch",
                        0
                        ]
                    }
                }
            },
            {
                "$project":
                {
                    _id:1,
                    name:1,
                    kategori:1,
                    image:1,
                    createdAt:1,
                    updatedAt:1,
                    index:1,
                    used:
                    {
                        "$ifNull":
                        [
                            "$countused",
                            0
                        ]
                    },
                    countused:
                    {
                        "$ifNull":
                        [
                            "$countused",
                            0
                        ]
                    },
                    countsearch:
                    {
                        "$ifNull":
                        [
                            "$countsearch",
                            0
                        ]
                    },
                    kategoricreatedAt:
                    {
                        "$arrayElemAt":
                        [
                            "$kategori_data.createdAt",0
                        ]
                    },
                    status:1,
                    type:1
                }
            },
        )

        if(keyword != null)
        {
            pipeline.push(
                {
                    "$match":
                    {
                        "name":
                        {
                            "$regex":keyword,
                            "$options":"i"
                        }
                    }
                }
            )
        }

        if(keyword == null || keyword == undefined)
        {
            pipeline.push(
                {
                    "$sort":
                    {
                        "index":1
                    }
                },
                {
                    "$group":
                    {
                        _id:"kategori",
                        kategoritime:
                        {
                            "$first":"$kategoricreatedAt"
                        },
                        data:
                        {
                            "$push":
                            {
                                _id: "$_id",
                                name: "$name",
                                kategori: "$kategori",
                                image: "$image",
                                createdAt: "$createdAt",
                                updatedAt: "$updatedAt",
                                used: "$used",
                                status: "$status",
                                isDelete: "$isDelete",
                                index: "$index",
                                type: "$type",
                                countsearch: "$countsearch", 
                                countused: "$countused", 
                            }
                        }
                    }
                },
                {
                    "$sort":
                    {
                        "kategoritime":1
                    }
                },
                {
                    "$unwind":
                    {
                        path:"$data",
                        preserveNullAndEmptyArrays:true
                    }
                },
                {
                    "$project":
                    {
                        _id: "$data._id",
                        name: "$data.name",
                        kategori: "$data.kategori",
                        image: "$data.image",
                        createdAt: "$data.createdAt",
                        updatedAt: "$data.updatedAt",
                        used: "$data.used",
                        status: "$data.status",
                        isDelete: "$data.isDelete",
                        index: "$data.index",
                        type: "$data.type",
                        countused: "$data.countused",
                        countsearch: "$data.countsearch",
                    }
                }
            )
        }
        else
        {
            pipeline.push(
                {
                    "$sort":
                    {
                        countused:-1,
                        name:1
                    }
                },
            );
        }

        if(page > 0)
        {
            pipeline.push({
                "$skip":(page * limit)
            });
        }

        if(limit > 0)
        {
            pipeline.push({
                "$limit":limit
            });
        }

        var data = await this.MediastikerModel.aggregate(pipeline);
        return data;
    }

}
