import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { CreateAccountbalancesDto } from './dto/create-accountbalances.dto';
import { Accountbalances, AccountbalancesDocument } from './schemas/accountbalances.schema';
import { PostContentService } from '../../content/posts/postcontent.service';

@Injectable()
export class AccountbalancesService {

    constructor(
        @InjectModel(Accountbalances.name, 'SERVER_FULL')
        private readonly accountbalancesModel: Model<AccountbalancesDocument>,
        private readonly postContentService: PostContentService,
    ) { }
    async findOne(iduser: Types.ObjectId): Promise<Accountbalances> {
        return this.accountbalancesModel.findOne({ $and: [{ "iduser": iduser }, { "type": "sell" }] }).sort({
            _id: -1
        }).limit(1).exec();
    }

    async findsaldo(iduser: object) {
        const query = await this.accountbalancesModel.aggregate([

            {
                $match: {
                    "iduser": iduser
                }
            },

            { $group: { _id: null, totalsaldo: { $sum: { $subtract: ["$kredit", "$debet"] } }, totalpenarikan: { $sum: "$debet" } } },

        ]);
        return query;
    }

    async findsaldoall() {
        const query = await this.accountbalancesModel.aggregate([
            { $group: { _id: null, totalsaldo: { $sum: { $subtract: ["$kredit", "$debet"] } }, totalpenarikan: { $sum: "$debet" } } },


        ]);
        return query;
    }

    async findwalletpenarikan(iduser: object, datestart: string, dateend: string) {

        var currentdate = new Date(new Date(dateend).setDate(new Date(dateend).getDate() + 1));

        var enddate = currentdate.toISOString();
        const query = await this.accountbalancesModel.aggregate([

            {
                $match: {

                    "iduser": iduser, "timestamp": { $gte: datestart, $lte: enddate }, "type": "withdraw"
                }
            },
            {
                $group: {
                    _id: null,
                    totalpenarikan: {
                        $sum: "$debet"
                    }
                }
            },


        ]);
        return query;
    }

    async findwallettotalsaldo(iduser: object) {
        const query = await this.accountbalancesModel.aggregate([

            {
                $match: {

                    "iduser": iduser
                }
            },
            {
                $group: {
                    _id: null,
                    totalsaldo: { $sum: { $subtract: ["$kredit", "$debet"] } },
                }
            },


        ]);
        return query;
    }

    async findwallethistory(iduser: object, datestart: string, dateend: string, skip: number, limit: number) {

        var currentdate = new Date(new Date(dateend).setDate(new Date(dateend).getDate() + 1));

        var enddate = currentdate.toISOString();
        const query = await this.accountbalancesModel.aggregate([

            {
                $match: {

                    "iduser": iduser, "timestamp": { $gte: datestart, $lte: enddate }
                }
            },
            {
                $project: {
                    iduser: "$iduser",
                    type: "$type",
                    timestamp: "$timestamp",
                    description: "$description",
                    amount:
                    {
                        $cond: { if: { $eq: ["$debet", 0] }, then: "$kredit", else: "$debet" }
                    },
                    status:
                    {
                        $cond: { if: { $or: [{ $eq: ["$type", "withdraw"] }, { $eq: ["$type", "inquiry"] }, { $eq: ["$type", "disbursement"] }, { $eq: ["$type", "PPH"] }] }, then: "SENT", else: "RECEIVE" }
                    },



                }

            }, { $skip: skip }, { $limit: limit }

        ]);
        return query;
    }

    async create(CreateAccountbalancesDto: CreateAccountbalancesDto): Promise<Accountbalances> {
        let data = await this.accountbalancesModel.create(CreateAccountbalancesDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async createdata(datas: {
        iduser: { oid: String; },
        debet: number,
        kredit: number,
        type: string,
        timestamp: string,
        description: string

    }): Promise<Accountbalances> {


        let data = await this.accountbalancesModel.create(datas);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }


    async findhistorySell(iduser: ObjectId, skip: number, limit: number) {
        const query = await this.accountbalancesModel.aggregate([
            {
                $lookup: {
                    from: "transactions",
                    localField: "iduser",
                    foreignField: "idusersell",
                    as: "field"
                }
            }, {
                $unwind: {
                    path: "$field",
                    preserveNullAndEmptyArrays: false
                }
            }, {
                $match: {
                    "field.status": "success",
                    iduser: iduser
                }
            }, {
                $sort: {
                    timestamp: 1
                }
            }, {
                $lookup: {
                    from: "userbasics",
                    localField: "iduser",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            }, {
                $lookup: {
                    from: "posts2",
                    localField: "field.postid",
                    foreignField: "postID",
                    as: "post_data"
                }
            }, {
                $lookup: {
                    from: "mediapicts2",
                    localField: "post_data.contentMedias.$id",
                    foreignField: "_id",
                    as: "mediaPict_data"
                }
            }, {
                $lookup: {
                    from: "mediadiaries2",
                    localField: "post_data.contentMedias.$id",
                    foreignField: "_id",
                    as: "mediadiaries_data"
                }
            }, {
                $lookup: {
                    from: "mediavideos2",
                    localField: "post_data.contentMedias.$id",
                    foreignField: "_id",
                    as: "mediavideos_data"
                }
            }, {
                $project: {
                    iduser: "$iduser",
                    debet: "$debet",
                    kredit: "$kredit",
                    type: "$type",
                    timestamp: "$timestamp",
                    description: "$description",
                    idTransaction: "$field._id",
                    noinvoice: "$field.noinvoice",
                    nova: "$field.nova",
                    expiredtimeva: "$field.expiredtimeva",
                    salelike: "$field.salelike",
                    saleview: "$field.saleview",
                    bank: "$field.bank",
                    totalamount: "$field.totalamount",
                    user: {
                        $arrayElemAt: [
                            "$userbasics_data",
                            0
                        ]
                    },
                    postdata: {
                        $arrayElemAt: [
                            "$post_data",
                            0
                        ]
                    },
                    mediapict: {
                        $arrayElemAt: [
                            "$mediaPict_data",
                            0
                        ]
                    },
                    mediadiaries: {
                        $arrayElemAt: [
                            "$mediadiaries_data",
                            0
                        ]
                    },
                    mediavideos: {
                        $arrayElemAt: [
                            "$mediavideos_data",
                            0
                        ]
                    }
                }
            }, {
                $project: {
                    contentMedias: "$postdata.contentMedias",
                    iduser: "$iduser",
                    debet: "$debet",
                    kredit: "$kredit",
                    type: "$type",
                    timestamp: "$timestamp",
                    description: "$description",
                    idTransaction: "$idTransaction",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    totalamount: "$totalamount",
                    fullName: "$user.fullName",
                    email: "$user.email",
                    postID: "$postdata.postID",
                    postType: "$postdata.postType",
                    mediapict: "$mediapict",
                    mediadiaries: "$mediadiaries",
                    mediavideos: "$mediavideos",
                    mediapictPath: "$mediapict.mediaBasePath",
                    mediadiariPath: "$mediadiaries.mediaBasePath",
                    mediavideoPath: "$mediavideos.mediaBasePath"
                }
            }, {
                $project: {
                    refs: {
                        $arrayElemAt: [
                            "$contentMedias",
                            0
                        ]
                    },
                    iduser: "$iduser",
                    debet: "$debet",
                    kredit: "$kredit",
                    type: "$type",
                    timestamp: "$timestamp",
                    description: "$description",
                    idTransaction: "$idTransaction",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    totalamount: "$totalamount",
                    fullName: "$fullName",
                    email: "$email",
                    postID: "$postID",
                    postType: "$postType",
                    mediapict: "$mediapict",
                    mediadiaries: "$mediadiaries",
                    mediavideos: "$mediavideos",
                    mediapictPath: "$mediapictPath",
                    mediadiariPath: "$mediadiariPath",
                    mediavideoPath: "$mediavideoPath"
                }
            }, {
                $project: {
                    refs: "$refs.$ref",
                    iduser: "$iduser",
                    debet: "$debet",
                    kredit: "$kredit",
                    type: "$type",
                    timestamp: "$timestamp",
                    description: "$description",
                    idTransaction: "$idTransaction",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    totalamount: "$totalamount",
                    fullName: "$fullName",
                    email: "$email",
                    postID: "$postID",
                    postType: "$postType",
                    mediapict: "$mediapict",
                    mediadiaries: "$mediadiaries",
                    mediavideos: "$mediavideos",
                    mediapictPath: "$mediapictPath",
                    mediadiariPath: "$mediadiariPath",
                    mediavideoPath: "$mediavideoPath"
                }
            }, {
                $project: {
                    refs: "$refs",
                    iduser: "$iduser",
                    debet: "$debet",
                    kredit: "$kredit",
                    type: "$type",
                    timestamp: "$timestamp",
                    description: "$description",
                    idTransaction: "$idTransaction",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    totalamount: "$totalamount",
                    fullName: "$fullName",
                    email: "$email",
                    postID: "$postID",
                    postType: "$postType",
                    mediapict: "$mediapict",
                    mediadiaries: "$mediadiaries",
                    mediavideos: "$mediavideos",
                    mediapictPath: "$mediapictPath",
                    mediadiariPath: "$mediadiariPath",
                    mediavideoPath: "$mediavideoPath"
                }
            }, {
                $addFields: {
                    concatmediapict: "/pict",
                    "media_pict": {
                        $replaceOne: {
                            input: "$mediapict.mediaUri",
                            find: "_0001.jpeg",
                            replacement: ""
                        }
                    },
                    concatmediadiari: "/stream",
                    concatthumbdiari: "/thumb",
                    "media_diari": "$mediadiaries.mediaUri",
                    concatmediavideo: "/stream",
                    concatthumbvideo: "/thumb",
                    "media_video": "$mediavideos.mediaUri"
                }
            }, {
                $project: {

                    iduser: "$iduser",
                    fullName: "$fullName",
                    email: "$email",
                    debet: "$debet",
                    kredit: "$kredit",
                    type: "$type",
                    timestamp: "$timestamp",
                    description: "$description",
                    idTransaction: "$idTransaction",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    totalamount: "$totalamount",

                    postID: "$postID",
                    postType: "$postType",
                    mediaBasePath: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediapicts"
                                        ]
                                    },
                                    then: "$mediapict.mediaBasePath"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediadiaries"
                                        ]
                                    },
                                    then: "$mediadiaries.mediaBasePath"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediavideos"
                                        ]
                                    },
                                    then: "$mediavideos.mediaBasePath"
                                }
                            ],
                            default: ""
                        }
                    },
                    mediaUri: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediapicts"
                                        ]
                                    },
                                    then: "$mediapict.mediaUri"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediadiaries"
                                        ]
                                    },
                                    then: "$mediadiaries.mediaUri"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediavideos"
                                        ]
                                    },
                                    then: "$mediavideos.mediaUri"
                                }
                            ],
                            default: ""
                        }
                    },
                    mediaType: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediapicts"
                                        ]
                                    },
                                    then: "$mediapict.mediaType"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediadiaries"
                                        ]
                                    },
                                    then: "$mediadiaries.mediaType"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediavideos"
                                        ]
                                    },
                                    then: "$mediavideos.mediaType"
                                }
                            ],
                            default: ""
                        }
                    },
                    mediaThumbEndpoint: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediapicts"
                                        ]
                                    },
                                    then: "$mediadiaries.mediaThumb"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediadiaries"
                                        ]
                                    },
                                    then: {
                                        $concat: [
                                            "$concatthumbdiari",
                                            "/",
                                            "$postID"
                                        ]
                                    }
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediavideos"
                                        ]
                                    },
                                    then: {
                                        $concat: [
                                            "$concatthumbvideo",
                                            "/",
                                            "$postID"
                                        ]
                                    }
                                }
                            ],
                            default: ""
                        }
                    },
                    mediaEndpoint: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediapicts"
                                        ]
                                    },
                                    then: {
                                        $concat: [
                                            "$concatmediapict",
                                            "/",
                                            "$postID"
                                        ]
                                    }
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediadiaries"
                                        ]
                                    },
                                    then: {
                                        $concat: [
                                            "$concatmediadiari",
                                            "/",
                                            "$postID"
                                        ]
                                    }
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediavideos"
                                        ]
                                    },
                                    then: {
                                        $concat: [
                                            "$concatmediavideo",
                                            "/",
                                            "$postID"
                                        ]
                                    }
                                }
                            ],
                            default: ""
                        }
                    },
                    mediaThumbUri: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediapicts"
                                        ]
                                    },
                                    then: "$mediadiaries.mediaThumb"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediadiaries"
                                        ]
                                    },
                                    then: "$mediadiaries.mediaThumb"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediavideos"
                                        ]
                                    },
                                    then: "$mediavideos.mediaThumb"
                                }
                            ],
                            default: ""
                        }
                    },
                }
            }, {
                $skip: skip
            }, {
                $limit: limit
            }
        ]);
        return query;
    }

    async findreward(iduser: ObjectId, startdate: string, enddate: string, skip: number, limit: number) {

        var pipeline = [];
        if (startdate !== undefined) {
            pipeline.push({ $match: { timestamp: { "$gte": startdate } } });

        }
        if (enddate !== undefined) {
            pipeline.push({
                $match: {
                    timestamp: { "$lte": enddate }
                }
            });
        }
        pipeline.push({ $match: { iduser: iduser } });
        pipeline.push({ $match: { type: "rewards" } });
        if (skip > 0) {
            pipeline.push({
                "$skip": skip
            });
        }
        if (limit > 0) {
            pipeline.push({
                "$limit": limit
            });
        }
        pipeline.push({ $sort: { timestamp: -1 } });
        // console.log(pipeline);
        let query = await this.accountbalancesModel.aggregate(pipeline);
        return query;



    }
    async findrewardcount(iduser: ObjectId, startdate: string, enddate: string) {
        if (startdate !== undefined && enddate !== undefined) {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
            let query = await this.accountbalancesModel.aggregate([

                {
                    $match: {
                        iduser: iduser, type: "rewards", timestamp: { "$gte": startdate, "$lte": dateend }
                    }
                },
                { $sort: { timestamp: -1 }, },

            ]);
            return query;

        } else {
            let query = await this.accountbalancesModel.aggregate([

                {
                    $match: {
                        iduser: iduser, type: "rewards"
                    }
                },
                { $sort: { timestamp: -1 }, },

            ]);
            return query;
        }


    }

    async detailrewards(id: ObjectId) {
        let query = await this.accountbalancesModel.aggregate([

            {
                $match: {
                    _id: id
                }
            },
            {
                "$lookup": {
                    "from": "ads",
                    "as": "adsdata",
                    "let": {
                        "localID": "$idtrans",

                    },
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$eq": [
                                        "$_id",
                                        "$$localID"
                                    ]
                                }
                            }
                        },
                        {
                            "$lookup": {
                                "from": "adstypes",
                                "as": "typesdata",
                                "let": {
                                    "localID": "$typeAdsID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$localID"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        }
                    ],

                }
            },
            {
                $unwind: {
                    path: "$adsdata",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $project: {
                    kredit: 1,
                    type: '$adsdata.type',
                    idApsara: '$adsdata.idApsara',
                    duration: '$adsdata.duration',
                    description: '$adsdata.description',
                    timestamp: 1,
                    datatype: { $arrayElemAt: ['$adsdata.typesdata', 0] },


                }
            },
            {
                $project: {
                    kredit: 1,
                    type: 1,
                    idApsara: 1,
                    duration: 1,
                    description: 1,
                    timestamp: 1,
                    from: '$datatype.nameType',
                    status: "Recieved Successfully"

                }
            }


        ]);


        var dataquery = null;
        dataquery = query;
        var datanew = null;
        var data = [];
        let pict: String[] = [];
        var objk = {};
        var type = null;
        var idapsara = null;
        var apsara = null;
        var idapsaradefine = null;
        var apsaradefine = null;
        for (var i = 0; i < dataquery.length; i++) {
            try {
                idapsara = dataquery[i].idApsara;
            } catch (e) {
                idapsara = "";
            }


            if (idapsara === undefined || idapsara === "" || idapsara === null || idapsara === "other") {
                idapsaradefine = "";
            } else {
                idapsaradefine = idapsara;
            }
            var type = dataquery[i].type;
            pict = [idapsara];

            if (idapsara === "") {

            } else {
                if (type === "image") {

                    try {
                        datanew = await this.postContentService.getImageApsara(pict);
                    } catch (e) {
                        datanew = [];
                    }
                }
                else if (type === "video") {
                    try {
                        datanew = await this.postContentService.getVideoApsara(pict);
                    } catch (e) {
                        datanew = [];
                    }

                }

                objk = {
                    "_id": dataquery[i]._id,
                    "kredit": dataquery[i].kredit,
                    "timestamp": dataquery[i].timestamp,
                    "type": dataquery[i].type,
                    "duration": dataquery[i].duration,
                    "description": dataquery[i].description,
                    "from": dataquery[i].from,
                    "status": dataquery[i].status,
                    "apsaraId": idapsaradefine,
                    "media": datanew

                };

                data.push(objk);
            }
        }


        return data;
    }

    async getIncomeByDate(startdate:string){
        const mongoose = require('mongoose');
        var iddata = mongoose.Types.ObjectId("62144381602c354635ed786a");
        var before = new Date(startdate).toISOString().split("T")[0];
        var input = new Date();
        input.setDate(input.getDate() + 1);
        var today = new Date(input).toISOString().split("T")[0];
        //kalo error, coba ganti jadi set dan jadi object
        var query = await this.accountbalancesModel.aggregate([
            {
                "$match":
                {
                    timestamp:
                    {
                        "$gte":before,
                        "$lte":today
                    },
                    iduser: iddata
                }
            },
            {
                "$project":
                {
                    timestamp:
                    {
                        "$substr":
                        [
                            "$timestamp", 0, 10
                        ]
                    },
                    kredit:1
                }
            },
            {
                "$group":
                {
                    _id:
                    {
                        "$dateFromString": 
                        {
                            "format": "%Y-%m-%d",
                            "dateString": "$timestamp"
                        }
                    },
                    totalperhari:
                    {
                        "$sum":1
                    },
                    totalpendapatanperhari:
                    {
                        "$sum":"$kredit"
                    }
                }
            },
            {
                "$project":
                {
                    _id:1,
                    totalperhari:1,
                    totalpendapatanperhari:1,
                }
            },
            {
                "$unwind":
                {
                    path:"$_id"
                }
            },
            {
                "$sort":
                {
                    _id:1 
                }
            },
            {
                "$group":
                {
                    _id:null,
                    total:
                    {
                        "$sum":"$totalpendapatanperhari"
                    },
                    totaldata:
                    {
                        "$sum":"$totalperhari"
                    },
                    resultdata:
                    {
                        "$push":
                        {
                            _id:
                            {
                                "$substr":
                                [
                                {
                                    "$toString":"$_id"
                                },0,10
                                ]
                            },
                            totaldata:"$totalperhari",
                            totalpendapatanperhari:"$totalpendapatanperhari"
                        }
                    }
                }
            }
        ]);   
        
        return query;
    }

    async getTotalPendapatan(start: string, end:string)
    {
        const mongoose = require('mongoose');
        var iddata = mongoose.Types.ObjectId("62144381602c354635ed786a");
        var before = new Date(start).toISOString().split("T")[0];
        var input = new Date(end);
        input.setDate(input.getDate() + 1);
        var today = new Date(input).toISOString().split("T")[0];
        
        var query = await this.accountbalancesModel.aggregate([
            {
                "$match":
                {
                    iduser:
                    {
                        "$eq":iddata
                    },
                    timestamp:
                    {
                        "$gte": before,
                        "$lte": today,
                    },
                    "$or":
                    [
                        {
                            description:
                            {
                                "$regex":"sell voucher",
                                "$options":"i"
                            },
                        },
                        {
                            description:
                            {
                                "$regex":"Admin Charge",
                                "$options":"i"
                            },
                        },
                        {
                            description:
                            {
                                "$regex":"sell boost",
                                "$options":"i"
                            },
                        },
                    ]
                },
            },
            {
                "$group":
                {
                    _id:null,
                    total:
                    {
                        "$sum":"$kredit"
                    }
                }
            }
        ]);

        return query;
    }

    async getTotalPendapatanVoucher(start:string, end:string)
    {
        const mongoose = require('mongoose');
        var iddata = mongoose.Types.ObjectId("62144381602c354635ed786a");
        var before = new Date(start).toISOString().split("T")[0];
        var input = new Date(end);
        input.setDate(input.getDate() + 1);
        var today = new Date(input).toISOString().split("T")[0];
        
        var query = await this.accountbalancesModel.aggregate([
            {
                "$match":
                {
                    iduser:
                    {
                        "$eq":iddata
                    },
                    timestamp:
                    {
                        "$gte": before,
                        "$lte": today,
                    },
                    description:
                    {
                        "$regex":"sell voucher",
                        "$options":"i"
                    },
                },
            },
            {
                "$project":
                {
                    createdAt:
                    {
                        "$substr":
                        [
                            "$timestamp", 0, 10
                        ]
                    },
                    kredit:1
                }
            },
            {
                "$group":
                {
                    _id:
                    {
                        "$dateFromString": 
                        {
                            "format": "%Y-%m-%d",
                            "dateString": "$createdAt"
                        }
                    },
                    totalperhari:
                    {
                        "$sum":1
                    },
                    totalpendapatanperhari:
                    {
                        "$sum":"$kredit"
                    }
                }
            },
            {
                "$project":
                {
                    _id:1,
                    totalperhari:1,
                    totalpendapatanperhari:1,
                }
            },
            {
                "$unwind":
                {
                    path:"$_id"
                }
            },
            {
                "$sort":
                {
                    _id:1 
                }
            },
            {
                "$group":
                {
                    _id:null,
                    total:
                    {
                        "$sum":"$totalpendapatanperhari"
                    },
                    resultdata:
                    {
                        "$push":
                        {
                            _id:
                            {
                                "$substr":
                                [
                                {
                                    "$toString":"$_id"
                                },0,10
                                ]
                            },
                            totaldata:"$totalperhari",
                            totalpendapatanperhari:"$totalpendapatanperhari"
                        }
                    }
                }
            }
        ]);

        return query;
    }

    async getTotalPendapatanJualBeli(start:string, end:string)
    {
        const mongoose = require('mongoose');
        var iddata = mongoose.Types.ObjectId("62144381602c354635ed786a");
        var before = new Date(start).toISOString().split("T")[0];
        var input = new Date(end);
        input.setDate(input.getDate() + 1);
        var today = new Date(input).toISOString().split("T")[0];

        var query = await this.accountbalancesModel.aggregate([
            {
                "$match":
                {
                    timestamp:
                    {
                        "$gte":before,
                        "$lte":today
                    },
                    iduser: iddata,
                    type:"sell"
                }
            },
            {
                "$project":
                {
                    createdAt:
                    {
                        "$substr":
                        [
                            "$timestamp", 0, 10
                        ]
                    },
                    kredit:1
                }
            },
            {
                "$group":
                {
                    _id:
                    {
                        "$dateFromString": 
                        {
                            "format": "%Y-%m-%d",
                            "dateString": "$createdAt"
                        }
                    },
                    totalperhari:
                    {
                        "$sum":1
                    },
                    totalpendapatanperhari:
                    {
                        "$sum":"$kredit"
                    }
                }
            },
            {
                "$project":
                {
                    _id:1,
                    totalperhari:1,
                    totalpendapatanperhari:1,
                }
            },
            {
                "$unwind":
                {
                    path:"$_id"
                }
            },
            {
                "$sort":
                {
                    _id:1 
                }
            },
            {
                "$group":
                {
                    _id:null,
                    total:
                    {
                        "$sum":"$totalpendapatanperhari"
                    },
                    resultdata:
                    {
                        "$push":
                        {
                            _id:
                            {
                                "$substr":
                                [
                                {
                                    "$toString":"$_id"
                                },0,10
                                ]
                            },
                            totaldata:"$totalperhari",
                            totalpendapatanperhari:"$totalpendapatanperhari"
                        }
                    }
                }
            }
        ]);

        return query;
    }
}
