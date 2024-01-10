import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId, Types } from 'mongoose';
import { Mediastiker, MediastikerDocument } from './schemas/mediastiker.schema';
import { first, pipe } from 'rxjs';
import { start } from 'repl';

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
    async findByname(name: string, type: string,kategori:string,index:number): Promise<Mediastiker> {
        return this.MediastikerModel.findOne({ name: name, isDelete: false, type: type,kategori:kategori,index:index }).exec();
    }
    async findBynameTes(name: string): Promise<Mediastiker> {
        return this.MediastikerModel.findOne({ name: name, isDelete: true }).exec();
    }
    async findBynamekategori(type: string, kategori: string): Promise<Mediastiker> {
        return this.MediastikerModel.findOne({ type: type, kategori: kategori, isDelete: false }).exec();
    }
    async findByIndex(index: number, type: string, kategori: string): Promise<Mediastiker> {
        return this.MediastikerModel.findOne({ index: index, type: type, kategori: kategori, isDelete: false }).exec();
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
                    'index': { $gte: nourut }, 'type': type, 'kategori': kategori, isDelete: false
                }
            },
            {
                $sort: { 'index': 1 }
            }
        ]);
        return query;
    }
    async findByNourutTest(nourut: number, type: string, kategori: string) {
        var query = this.MediastikerModel.aggregate([
            {
                "$match":
                {
                    'index': { $gte: nourut }, 'type': type, 'kategori': kategori, isDelete: true
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
                    'type': type, 'kategori': kategori, isDelete: false
                }
            },
            {
                $sort: { 'index': -1 }
            }
        ]);
        return query;
    }

    async findByTypekategoriTes(type: string, kategori: string) {
        var query = this.MediastikerModel.aggregate([
            {
                "$match":
                {
                    'type': type, 'kategori': kategori, isDelete: true
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
                    'index': { $gte: nourutStart, $lte: nourutEnd }, 'type': type, 'kategori': kategori, isDelete: false
                }
            },
            {
                $sort: { 'index': -1 }
            }

        ]);
        return query;
    }

    async findByNourutLebihkecilTes(nourutStart: number, nourutEnd: number, type: string, kategori: string) {
        var query = this.MediastikerModel.aggregate([
            {
                "$match":
                {
                    'index': { $gte: nourutStart, $lte: nourutEnd }, 'type': type, 'kategori': kategori, isDelete: false
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
                    'index': { $lte: nourutStart, $gte: nourutEnd }, 'type': type, 'kategori': kategori, isDelete: false

                }
            },
            {
                $sort: { 'index': 1 }
            }

        ]);
        return query;
    }

    async findByNourutLebihbesarTest(nourutStart: number, nourutEnd: number, type: string, kategori: string) {
        var query = this.MediastikerModel.aggregate([
            {
                "$match":
                {
                    'index': { $lte: nourutStart, $gte: nourutEnd }, 'type': type, 'kategori': kategori, isDelete: true

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
    async findByKategoriTes(target: string): Promise<Mediastiker[]> {
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
                                isDelete: true
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
                                                countused:
                                                {
                                                    "$ne": 0
                                                }
                                            },
                                        ]
                                }
                            },
                            {
                                "$addFields":
                                {
                                    "lowername":
                                    {
                                        "$toLower": "$name"
                                    }
                                }
                            },
                            {
                                "$sort":
                                {
                                    countused: -1,
                                    lowername: 1
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
                                                countused:
                                                {
                                                    "$ne": 0
                                                }
                                            },
                                        ]
                                }
                            },
                            {
                                "$addFields":
                                {
                                    "lowername":
                                    {
                                        "$toLower": "$name"
                                    }
                                }
                            },
                            {
                                "$sort":
                                {
                                    countused: -1,
                                    lowername: 1
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
                                                countused:
                                                {
                                                    "$ne": 0
                                                }
                                            },
                                        ]
                                }
                            },
                            {
                                "$addFields":
                                {
                                    "lowername":
                                    {
                                        "$toLower": "$name"
                                    }
                                }
                            },
                            {
                                "$sort":
                                {
                                    countused: -1,
                                    lowername: 1
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
                "$or":
                    [
                        {
                            "name":
                            {
                                "$regex": setname,
                                "$options": "i"
                            }
                        },
                        {
                            "nameEn":
                            {
                                "$regex": setname,
                                "$options": "i"
                            }
                        },
                    ]
            })
        }

        if (startdate != null) {
            // var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));
            // var dateend = currentdate.toISOString().split(" ")[0];
            var convertstart = startdate.split(" ")[0];
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));
            var convertend = currentdate.toISOString().split("T")[0];

            firstmatch.push(
                {
                    "createdAt":
                    {
                        "$gte": convertstart
                    }
                },
                {
                    "createdAt":
                    {
                        "$lt": convertend
                    }
                },
            );
        }

        if (startused != null) {
            firstmatch.push(
                {
                    "countused":
                    {
                        "$gte": startused
                    }
                },
                {
                    "countused":
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

        pipeline.push(
            {
                "$addFields":
                {
                    "lowername":
                    {
                        "$toLower": "$name"
                    }
                }
            }
        );

        if (sorting != null) {
            if (sorting == "name+") {
                pipeline.push({
                    "$sort":
                    {
                        lowername: 1
                    }
                })
            }
            else if (sorting == "name-") {
                pipeline.push({
                    "$sort":
                    {
                        lowername: -1
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
            else if (sorting == "index") {
                pipeline.push({
                    "$sort":
                    {
                        index: 1,
                        createdAt: 1
                    }
                });
            }
            else {
                pipeline.push({
                    "$sort":
                    {
                        countused: -1,
                        lowername: 1
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

    async stickerchartbyId(id: string) {
        var mongo = require('mongoose');
        var konvertid = mongo.Types.ObjectId(id);
        var data = await this.MediastikerModel.aggregate([
            {
                "$match":
                {
                    _id: konvertid
                }
            },
            {
                "$limit": 1
            },
            {
                "$lookup":
                {
                    from: "posts",
                    as: "posts_data",
                    let:
                    {
                        stiker_id: "$_id"
                    },
                    pipeline:
                        [
                            {
                                "$unwind":
                                {
                                    path: "$stiker"
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
                                    _id: "$email",
                                    tipedata:
                                    {
                                        "$push":
                                        {
                                            "postType": "$postType"
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
                                    path: "$basic_data",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                "$project":
                                {
                                    _id: 1,
                                    tipedata: 1,
                                    userInterests: "$basic_data.userInterests",
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
                                    _id: 1,
                                    tipedata: 1,
                                    totalpost:
                                    {
                                        "$size": "$tipedata"
                                    },
                                    userInterests: 1,
                                    age: 1,
                                    gender: 1,
                                    total: 1,
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
                                                    path: "$tipedata",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                "$group":
                                                {
                                                    _id: "$tipedata.postType",
                                                    total:
                                                    {
                                                        "$sum": 1
                                                    }
                                                }
                                            }
                                        ],
                                    "gender":
                                        [
                                            {
                                                "$group":
                                                {
                                                    _id: "$gender",
                                                    total:
                                                    {
                                                        "$sum": "$totalpost"
                                                    }
                                                }
                                            },
                                            {
                                                "$sort":
                                                {
                                                    total: -1
                                                }
                                            }
                                        ],
                                    "age":
                                        [
                                            {
                                                "$group":
                                                {
                                                    _id: "$age",
                                                    total:
                                                    {
                                                        "$sum": "$totalpost"
                                                    }
                                                }
                                            },
                                            {
                                                "$sort":
                                                {
                                                    total: -1
                                                }
                                            }
                                        ],
                                    "area":
                                        [
                                            {
                                                "$group":
                                                {
                                                    _id: "$state",
                                                    total:
                                                    {
                                                        "$sum": "$totalpost"
                                                    }
                                                }
                                            },
                                            {
                                                "$sort":
                                                {
                                                    total: -1
                                                }
                                            }
                                        ],
                                    "interest":
                                        [
                                            {
                                                "$unwind":
                                                {
                                                    path: "$userInterests"
                                                }
                                            },
                                            {
                                                "$project":
                                                {
                                                    interest: "$userInterests.$id"
                                                }
                                            },
                                            {
                                                "$group":
                                                {
                                                    _id: "$interest"
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
                                                    _id: 0,
                                                    interests:
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$interest_data.interestName", 0
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
                "$project":
                {
                    // used:"$countused",
                    search: "$countsearch",
                    used:
                    {
                        "$arrayElemAt":
                            [
                                "$posts_data.usedbytype", 0
                            ]
                    },
                    gender:
                    {
                        "$arrayElemAt":
                            [
                                "$posts_data.gender", 0
                            ]
                    },
                    age:
                    {
                        "$arrayElemAt":
                            [
                                "$posts_data.age", 0
                            ]
                    },
                    area:
                    {
                        "$arrayElemAt":
                            [
                                "$posts_data.area", 0
                            ]
                    },
                    interest:
                    {
                        "$arrayElemAt":
                            [
                                "$posts_data.interest", 0
                            ]
                    },
                }
            }
        ]);

        return data[0];
    }

    async listingapp(keyword: string, jenis: string) {
        var pipeline = [];
        pipeline.push(
            {
                "$match":
                {
                    "$and":
                        [
                            {
                                "type": jenis
                            },
                            {
                                "status": true
                            },
                            {
                                "isDelete": false
                            }
                        ]
                }
            },
            {
                "$lookup":
                {
                    "from": "stickerCategory",
                    "as": "kategori_data",
                    "let":
                    {
                        kategori_id: "$kategori",
                        tipe_id: "$type"
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
                                                            "$name", "$$kategori_id"
                                                        ]
                                                }
                                            },
                                            {
                                                "$expr":
                                                {
                                                    "$eq":
                                                        [
                                                            "$type", "$$tipe_id"
                                                        ]
                                                }
                                            },
                                            {
                                                active: true
                                            }
                                        ]
                                }
                            }
                        ]
                }
            },
            {
                "$project":
                {
                    _id: 1,
                    name: 1,
                    kategori: 1,
                    image: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    index: 1,
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
                                "$kategori_data.createdAt", 0
                            ]
                    },
                    kategoriicon:
                    {
                        "$arrayElemAt":
                            [
                                "$kategori_data.icon", 0
                            ]
                    },
                    status: 1,
                    type: 1,
                    isDelete: 1
                }
            },
        )


        if (keyword != null) {
            pipeline.push(
                {
                    "$match":
                    {
                        "$or":
                            [
                                {
                                    "name":
                                    {
                                        "$regex": keyword,
                                        "$options": "i"
                                    }
                                },
                                {
                                    "nameEn":
                                    {
                                        "$regex": keyword,
                                        "$options": "i"
                                    }
                                },
                            ]
                    }
                },
                {
                    "$addFields":
                    {
                        "lowername":
                        {
                            "$toLower": "$name"
                        }
                    }
                },
                {
                    "$sort":
                    {
                        countused: -1,
                        lowername: 1
                    }
                },
                {
                    "$group":
                    {
                        _id: null,
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
            )
        }
        else if (jenis == "GIF") {
            pipeline.push(
                {
                    "$sort":
                    {
                        "createdAt": -1
                    }
                },
                {
                    "$group":
                    {
                        _id: null,
                        data:
                        {
                            "$push":
                            {
                                _id: "$_id",
                                name: "$name",
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
            );
        }
        else if (jenis == "STICKER" || jenis == "EMOJI") {
            pipeline.push(
                {
                    "$addFields":
                    {
                        "lowername":
                        {
                            "$toLower": "$name"
                        }
                    }
                },
                {
                    "$sort":
                    {
                        "index": 1,
                        "lowername": 1
                    }
                },
                {
                    "$group":
                    {
                        _id: "$kategori",
                        kategoritime:
                        {
                            "$first": "$kategoricreatedAt"
                        },
                        kategoriicon:
                        {
                            "$first": "$kategoriicon"
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
                        "kategoritime": 1
                    }
                },
            );
        }


        // if((jenis == "STICKER" || jenis == "EMOJI") && keyword == null && keyword == undefined)
        // {
        //     pipeline.push(
        //         {
        //             "$unwind":
        //             {
        //                 path:"$data",
        //                 preserveNullAndEmptyArrays:true
        //             }
        //         }
        //     )
        // }

        var data = await this.MediastikerModel.aggregate(pipeline);
        return data;
    }

    async updatejamaah(listid: any[], status: string) {
        try {
            for (var i = 0; i < listid.length; i++) {
                var result = await this.myLoop(i, listid[i], status);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }

        // return result;
        return true;
    }

    async updatedata(list: any[], type: string) {
        if (list !== undefined) {
            for (let i = 0; i < list.length; i++) {
                let id = list[i]._id;
                var mongo = require('mongoose');

                if (type == "used") {
                    setTimeout(() => {
                        console.log('looping ke ' + i);
                        this.updateUsed(id.toString());
                    }, (i * 1000));
                } else {
                    setTimeout(() => {
                        console.log('looping ke ' + i);
                        this.updateSearch(id.toString());
                    }, (i * 1000));
                }


            }
        }
    }

    async myLoop(i: number, data: string, insertdata: string) {
        var updatedata = new Mediastiker();
        if (insertdata == "active") {
            updatedata.status = true;
        }
        else if (insertdata == "noneactive") {
            updatedata.status = false;
        }
        else if (insertdata == "delete") {
            updatedata.isDelete = true;
        }

        try {
            var result = await this.MediastikerModel.updateOne(
                {
                    "_id": data
                },
                updatedata,
                function (err, docs) {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        console.log("Updated Docs : ", docs);
                    }
                }
            );
        }
        catch (e) {
            console.log(e);
        }

        console.log(result);

        return result;
    }

    async updateUsed(_id: string) {
        this.MediastikerModel.updateOne(
            {
                _id: new mongoose.Types.ObjectId(_id),
            },
            { $inc: { countused: 1 } },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }
    async updateSearch(_id: string) {
        this.MediastikerModel.updateOne(
            {
                _id: new mongoose.Types.ObjectId(_id),
            },
            { $inc: { countsearch: 1 } },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }
}
