import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { Model, Types } from 'mongoose';
import { CreateTransactionsDto, VaCallback } from './dto/create-transactions.dto';
import { Transactions, TransactionsDocument } from './schemas/transactions.schema';
import { PostsService } from '../../content/posts/posts.service';
import { MediavideosService } from '../../content/mediavideos/mediavideos.service';
import { MediapictsService } from '../../content/mediapicts/mediapicts.service';
import { MediadiariesService } from '../../content/mediadiaries/mediadiaries.service';
import { PostContentService } from '../../content/posts/postcontent.service';
import { type } from 'os';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectModel(Transactions.name, 'SERVER_FULL')
        private readonly transactionsModel: Model<TransactionsDocument>,
        private readonly postsService: PostsService,
        private readonly mediavideosService: MediavideosService,
        private readonly mediapictsService: MediapictsService,
        private readonly mediadiariesService: MediadiariesService,
        private readonly postContentService: PostContentService,

    ) { }

    async findAll(): Promise<Transactions[]> {
        return this.transactionsModel.find().exec();
    }

    async findid(id: string): Promise<Transactions> {
        return this.transactionsModel.findOne({ _id: id }).exec();
    }

    async findpostidpost(postid: string): Promise<Transactions> {
        return this.transactionsModel.findOne({ postid: postid }).exec();
    }

    async findpostid(postid: string): Promise<Transactions> {
        return this.transactionsModel.findOne({ postid: postid, status: "Success" }).exec();
    }

    async findpostidanduser(postid: string, iduserbuyer: ObjectId): Promise<Transactions> {
        return this.transactionsModel.findOne({ postid: postid, iduserbuyer: iduserbuyer, status: "Success" }).exec();
    }

    async findpostidpending(postid: string): Promise<Transactions> {
        return this.transactionsModel.findOne({ postid: postid, status: "WAITING_PAYMENT" }).exec();
    }

    async findPendingByUser(iduserbuyer: string): Promise<Transactions> {
        return this.transactionsModel.findOne({ iduserbuyer: new mongoose.Types.ObjectId(iduserbuyer), status: "WAITING_PAYMENT" }).exec();
    }

    async findExpired(iduserbuyer: ObjectId): Promise<Transactions[]> {
        return this.transactionsModel.find({ status: "WAITING_PAYMENT", iduserbuyer: iduserbuyer }).exec();
    }
    async findExpiredSell(idusersell: ObjectId): Promise<Transactions[]> {
        return this.transactionsModel.find({ status: "WAITING_PAYMENT", idusersell: idusersell }).exec();
    }
    // async findpostidpendingVoucer(postid: any[]): Promise<Transactions> {
    //     return this.transactionsModel.findOne({ detail: postid, status: "WAITING_PAYMENT" }).exec();
    // }
    async findpostidpendingVoucer(): Promise<Transactions> {
        return this.transactionsModel.findOne({ type: "VOUCHER", status: "WAITING_PAYMENT" }).exec();
    }
    async findpostiddraft(postid: string): Promise<Transactions> {
        return this.transactionsModel.findOne({ postid: postid, status: "draft" }).exec();
    }
    async findva(nova: string): Promise<Transactions> {
        return this.transactionsModel.findOne({ nova: nova }).exec();
    }

    async findOne(noinvoice: string): Promise<Transactions> {
        return this.transactionsModel.findOne({ noinvoice: noinvoice }).exec();
    }

    async create(CreateTransactionsDto: CreateTransactionsDto): Promise<Transactions> {
        let data = await this.transactionsModel.create(CreateTransactionsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async update(
        id: string,
        createTransactionsDto: CreateTransactionsDto,
    ): Promise<Transactions> {
        let data = await this.transactionsModel.findByIdAndUpdate(
            id,
            createTransactionsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async updateone(id: Types.ObjectId, idaccountbalance: Types.ObjectId, payload: VaCallback): Promise<Object> {
        let data = await this.transactionsModel.updateOne({ "_id": id },
            { $set: { "status": "Success", "description": "buy CONTENT success", "accountbalance": idaccountbalance, payload: payload } });
        return data;
    }

    async updateoneVoucher(id: Types.ObjectId, idaccountbalance: Types.ObjectId, payload: VaCallback): Promise<Object> {
        let data = await this.transactionsModel.updateOne({ "_id": id },
            { $set: { "status": "Success", "description": "buy VOUCHER success", "accountbalance": idaccountbalance, payload: payload } });
        return data;
    }

    async updateoneBoost(id: Types.ObjectId, idaccountbalance: Types.ObjectId, payload: VaCallback): Promise<Object> {
        let data = await this.transactionsModel.updateOne({ "_id": id },
            { $set: { "status": "Success", "description": "buy BOOST CONTENT success", "accountbalance": idaccountbalance, payload: payload } });
        return data;
    }

    async updatestatuscancel(id: Types.ObjectId): Promise<Object> {
        let data = await this.transactionsModel.updateOne({ "_id": id },
            { $set: { "status": "Cancel", "description": "VA expired time" } });
        return data;
    }

    async findhistoryBuy(iduser: ObjectId, status: string, startdate: string, enddate: string, skip: number, limit: number) {

        var pipeline = [];

        if (status && status !== undefined) {
            pipeline.push({
                $match: {
                    status: status,

                }
            },);
        }


        if (startdate && startdate !== undefined) {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();

            pipeline.push({ $match: { timestamp: { "$gte": startdate } } });
        }
        if (enddate && enddate !== undefined) {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
            pipeline.push({ $match: { timestamp: { "$lte": dateend } } });

        }


        pipeline.push(
            {
                $match: {
                    iduserbuyer: iduser,
                    type: { $ne: "BOOST_CONTENT" }
                }
            },
            {
                $addFields: {
                    type: 'Buy',
                    jenis: "$type",

                },
            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "iduserbuyer",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            }, {
            $lookup: {
                from: "posts",
                localField: "postid",
                foreignField: "postID",
                as: "post_data"
            }
        }, {
            $lookup: {
                from: "mediapicts",
                localField: "post_data.contentMedias.$id",
                foreignField: "_id",
                as: "mediaPict_data"
            }
        }, {
            $lookup: {
                from: "mediadiaries",
                localField: "post_data.contentMedias.$id",
                foreignField: "_id",
                as: "mediadiaries_data"
            }
        }, {
            $lookup: {
                from: "mediavideos",
                localField: "post_data.contentMedias.$id",
                foreignField: "_id",
                as: "mediavideos_data"
            }
        },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "idusersell",
                    foreignField: "_id",
                    as: "userbasics_sell"
                }
            },
            {
                $project: {
                    iduser: "$iduserbuyer",
                    type: "$type",
                    jenis: "$jenis",
                    timestamp: "$timestamp",
                    description: "$description",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    status: "$status",
                    user: {
                        $arrayElemAt: [
                            "$userbasics_data",
                            0
                        ]
                    },
                    usersell: {
                        $arrayElemAt: [
                            "$userbasics_sell",
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
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$user.fullName",
                email: "$user.email",
                penjual: "$usersell.fullName",
                emailpenjual: "$usersell.email",
                postID: "$postdata.postID",
                postType: "$postdata.postType",
                descriptionContent: '$postdata.description',
                title: '$postdata.description',
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
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                penjual: "$penjual",
                emailpenjual: "$emailpenjual",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',
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
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                penjual: "$penjual",
                emailpenjual: "$emailpenjual",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',
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
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                penjual: "$penjual",
                emailpenjual: "$emailpenjual",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',
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
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                penjual: "$penjual",
                emailpenjual: "$emailpenjual",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',
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
                apsaraId: {
                    $switch: {
                        branches: [
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediapicts"
                                    ]
                                },
                                then: "$mediapict.apsaraId"
                            },
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediadiaries"
                                    ]
                                },
                                then: "$mediadiaries.apsaraId"
                            },
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediavideos"
                                    ]
                                },
                                then: "$mediavideos.apsaraId"
                            }
                        ],
                        default: ""
                    }
                },
                apsara: {
                    $switch: {
                        branches: [
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediapicts"
                                    ]
                                },
                                then: "$mediapict.apsara"
                            },
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediadiaries"
                                    ]
                                },
                                then: "$mediadiaries.apsara"
                            },
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediavideos"
                                    ]
                                },
                                then: "$mediavideos.apsara"
                            }
                        ],
                        default: false
                    }
                },
            }
        },
            { $sort: { timestamp: -1 }, },);

        if (skip > 0) {
            pipeline.push({ $skip: skip });
        }

        if (limit > 0) {
            pipeline.push({ $limit: limit });
        }


        const query = await this.transactionsModel.aggregate(pipeline);

        var data = null;
        var arrdata = [];
        let pict: String[] = [];
        var objk = {};
        var type = null;
        var idapsara = null;
        var apsara = null;
        var idapsaradefine = null;
        var apsaradefine = null;
        for (var i = 0; i < query.length; i++) {
            try {
                idapsara = query[i].apsaraId;
            } catch (e) {
                idapsara = "";
            }
            try {
                apsara = query[i].apsara;
            } catch (e) {
                apsara = false;
            }
            var type = query[i].postType;
            pict = [idapsara];

            if (idapsara === "") {
                data = [];
            } else {
                if (type === "pict") {

                    try {
                        data = await this.postContentService.getImageApsara(pict);
                    } catch (e) {
                        data = [];
                    }
                }
                else if (type === "vid") {
                    try {
                        data = await this.postContentService.getVideoApsara(pict);
                    } catch (e) {
                        data = [];
                    }

                }
                else if (type === "story") {
                    try {
                        data = await this.postContentService.getVideoApsara(pict);
                    } catch (e) {
                        data = [];
                    }
                }
                else if (type === "diary") {
                    try {
                        data = await this.postContentService.getVideoApsara(pict);
                    } catch (e) {
                        data = [];
                    }
                }
            }

            if (apsara === undefined || apsara === "" || apsara === null || apsara === false) {
                apsaradefine = false;
            } else {
                apsaradefine = true;
            }

            if (idapsara === undefined || idapsara === "" || idapsara === null) {
                idapsaradefine = "";
            } else {
                idapsaradefine = idapsara;
            }
            objk = {
                "_id": query[i]._id,
                "iduser": query[i].iduser,
                "type": query[i].type,
                "jenis": query[i].jenis,
                "timestamp": query[i].timestamp,
                "description": query[i].description,
                "noinvoice": query[i].noinvoice,
                "nova": query[i].nova,
                "expiredtimeva": query[i].expiredtimeva,
                "salelike": query[i].salelike,
                "saleview": query[i].saleview,
                "bank": query[i].bank,
                "amount": query[i].amount,
                "totalamount": query[i].totalamount,
                "status": query[i].status,
                "fullName": query[i].fullName,
                "email": query[i].email,
                "penjual": query[i].penjual,
                "emailpenjual": query[i].emailpenjual,
                "postID": query[i].postID,
                "postType": query[i].postType,
                "descriptionContent": query[i].descriptionContent,
                "title": query[i].title,
                "mediaType": query[i].mediaType,
                "mediaEndpoint": query[i].mediaEndpoint,
                "apsaraId": idapsaradefine,
                "apsara": apsaradefine,
                "media": data
            };

            arrdata.push(objk);
        }
        return arrdata;



    }

    async findhistoryBuyAll(iduser: ObjectId, status: string, startdate: string, enddate: string, skip: number, limit: number) {

        var pipeline = [];

        if (status && status !== undefined) {
            pipeline.push({
                $match: {
                    status: status,

                }
            },);
        }


        if (startdate && startdate !== undefined) {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();

            pipeline.push({ $match: { timestamp: { "$gte": startdate } } });
        }
        if (enddate && enddate !== undefined) {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
            pipeline.push({ $match: { timestamp: { "$lte": dateend } } });

        }


        pipeline.push(
            {
                $match: {
                    iduserbuyer: iduser,

                }
            },
            {
                $addFields: {
                    type: 'Buy',
                    jenis: "$type",

                },
            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "iduserbuyer",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            }, {
            $lookup: {
                from: "posts",
                localField: "postid",
                foreignField: "postID",
                as: "post_data"
            }
        }, {
            $lookup: {
                from: "mediapicts",
                localField: "post_data.contentMedias.$id",
                foreignField: "_id",
                as: "mediaPict_data"
            }
        }, {
            $lookup: {
                from: "mediadiaries",
                localField: "post_data.contentMedias.$id",
                foreignField: "_id",
                as: "mediadiaries_data"
            }
        }, {
            $lookup: {
                from: "mediavideos",
                localField: "post_data.contentMedias.$id",
                foreignField: "_id",
                as: "mediavideos_data"
            }
        },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "idusersell",
                    foreignField: "_id",
                    as: "userbasics_sell"
                }
            },
            {
                $project: {
                    iduser: "$iduserbuyer",
                    type: "$type",
                    jenis: "$jenis",
                    timestamp: "$timestamp",
                    description: "$description",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    status: "$status",
                    user: {
                        $arrayElemAt: [
                            "$userbasics_data",
                            0
                        ]
                    },
                    usersell: {
                        $arrayElemAt: [
                            "$userbasics_sell",
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
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$user.fullName",
                email: "$user.email",
                penjual: "$usersell.fullName",
                emailpenjual: "$usersell.email",
                postID: "$postdata.postID",
                postType: "$postdata.postType",
                descriptionContent: '$postdata.description',
                title: '$postdata.description',
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
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                penjual: "$penjual",
                emailpenjual: "$emailpenjual",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',
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
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                penjual: "$penjual",
                emailpenjual: "$emailpenjual",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',
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
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                penjual: "$penjual",
                emailpenjual: "$emailpenjual",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',
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
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                penjual: "$penjual",
                emailpenjual: "$emailpenjual",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',
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
                apsaraId: {
                    $switch: {
                        branches: [
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediapicts"
                                    ]
                                },
                                then: "$mediapict.apsaraId"
                            },
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediadiaries"
                                    ]
                                },
                                then: "$mediadiaries.apsaraId"
                            },
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediavideos"
                                    ]
                                },
                                then: "$mediavideos.apsaraId"
                            }
                        ],
                        default: ""
                    }
                },
                apsara: {
                    $switch: {
                        branches: [
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediapicts"
                                    ]
                                },
                                then: "$mediapict.apsara"
                            },
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediadiaries"
                                    ]
                                },
                                then: "$mediadiaries.apsara"
                            },
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediavideos"
                                    ]
                                },
                                then: "$mediavideos.apsara"
                            }
                        ],
                        default: false
                    }
                },
            }
        },
            { $sort: { timestamp: -1 }, },);

        if (skip > 0) {
            pipeline.push({ $skip: skip });
        }

        if (limit > 0) {
            pipeline.push({ $limit: limit });
        }


        const query = await this.transactionsModel.aggregate(pipeline);

        var data = null;
        var arrdata = [];
        let pict: String[] = [];
        var objk = {};
        var type = null;
        var idapsara = null;
        var apsara = null;
        var idapsaradefine = null;
        var apsaradefine = null;
        for (var i = 0; i < query.length; i++) {
            try {
                idapsara = query[i].apsaraId;
            } catch (e) {
                idapsara = "";
            }
            try {
                apsara = query[i].apsara;
            } catch (e) {
                apsara = false;
            }
            var type = query[i].postType;
            pict = [idapsara];

            if (idapsara === "") {
                data = [];
            } else {
                if (type === "pict") {

                    try {
                        data = await this.postContentService.getImageApsara(pict);
                    } catch (e) {
                        data = [];
                    }
                }
                else if (type === "vid") {
                    try {
                        data = await this.postContentService.getVideoApsara(pict);
                    } catch (e) {
                        data = [];
                    }

                }
                else if (type === "story") {
                    try {
                        data = await this.postContentService.getVideoApsara(pict);
                    } catch (e) {
                        data = [];
                    }
                }
                else if (type === "diary") {
                    try {
                        data = await this.postContentService.getVideoApsara(pict);
                    } catch (e) {
                        data = [];
                    }
                }
            }

            if (apsara === undefined || apsara === "" || apsara === null || apsara === false) {
                apsaradefine = false;
            } else {
                apsaradefine = true;
            }

            if (idapsara === undefined || idapsara === "" || idapsara === null) {
                idapsaradefine = "";
            } else {
                idapsaradefine = idapsara;
            }
            objk = {
                "_id": query[i]._id,
                "iduser": query[i].iduser,
                "type": query[i].type,
                "jenis": query[i].jenis,
                "timestamp": query[i].timestamp,
                "description": query[i].description,
                "noinvoice": query[i].noinvoice,
                "nova": query[i].nova,
                "expiredtimeva": query[i].expiredtimeva,
                "salelike": query[i].salelike,
                "saleview": query[i].saleview,
                "bank": query[i].bank,
                "amount": query[i].amount,
                "totalamount": query[i].totalamount,
                "status": query[i].status,
                "fullName": query[i].fullName,
                "email": query[i].email,
                "penjual": query[i].penjual,
                "emailpenjual": query[i].emailpenjual,
                "postID": query[i].postID,
                "postType": query[i].postType,
                "descriptionContent": query[i].descriptionContent,
                "title": query[i].title,
                "mediaType": query[i].mediaType,
                "mediaEndpoint": query[i].mediaEndpoint,
                "apsaraId": idapsaradefine,
                "apsara": apsaradefine,
                "media": data
            };

            arrdata.push(objk);
        }
        return arrdata;
    }

    async findhistoryBuyBoost(iduser: ObjectId, status: string, startdate: string, enddate: string, skip: number, limit: number) {

        var pipeline = [];

        if (status && status !== undefined) {
            pipeline.push({
                $match: {
                    status: status,

                }
            },);
        }


        if (startdate && startdate !== undefined) {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();

            pipeline.push({ $match: { timestamp: { "$gte": startdate } } });
        }
        if (enddate && enddate !== undefined) {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
            pipeline.push({ $match: { timestamp: { "$lte": dateend } } });

        }


        pipeline.push(
            {
                $match: {
                    iduserbuyer: iduser,
                    type: "BOOST_CONTENT"
                }
            },
            {
                $addFields: {
                    type: 'Buy',
                    jenis: "$type",

                },
            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "iduserbuyer",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            }, {
            $lookup: {
                from: "posts",
                localField: "postid",
                foreignField: "postID",
                as: "post_data"
            }
        }, {
            $lookup: {
                from: "mediapicts",
                localField: "post_data.contentMedias.$id",
                foreignField: "_id",
                as: "mediaPict_data"
            }
        }, {
            $lookup: {
                from: "mediadiaries",
                localField: "post_data.contentMedias.$id",
                foreignField: "_id",
                as: "mediadiaries_data"
            }
        }, {
            $lookup: {
                from: "mediavideos",
                localField: "post_data.contentMedias.$id",
                foreignField: "_id",
                as: "mediavideos_data"
            }
        },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "idusersell",
                    foreignField: "_id",
                    as: "userbasics_sell"
                }
            },
            {
                $project: {
                    iduser: "$iduserbuyer",
                    type: "$type",
                    jenis: "$jenis",
                    timestamp: "$timestamp",
                    description: "$description",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    status: "$status",
                    user: {
                        $arrayElemAt: [
                            "$userbasics_data",
                            0
                        ]
                    },
                    usersell: {
                        $arrayElemAt: [
                            "$userbasics_sell",
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
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$user.fullName",
                email: "$user.email",
                penjual: "$usersell.fullName",
                emailpenjual: "$usersell.email",
                postID: "$postdata.postID",
                postType: "$postdata.postType",
                descriptionContent: '$postdata.description',
                title: '$postdata.description',
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
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                penjual: "$penjual",
                emailpenjual: "$emailpenjual",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',
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
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                penjual: "$penjual",
                emailpenjual: "$emailpenjual",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',
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
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                penjual: "$penjual",
                emailpenjual: "$emailpenjual",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',
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
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                penjual: "$penjual",
                emailpenjual: "$emailpenjual",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',
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
                apsaraId: {
                    $switch: {
                        branches: [
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediapicts"
                                    ]
                                },
                                then: "$mediapict.apsaraId"
                            },
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediadiaries"
                                    ]
                                },
                                then: "$mediadiaries.apsaraId"
                            },
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediavideos"
                                    ]
                                },
                                then: "$mediavideos.apsaraId"
                            }
                        ],
                        default: ""
                    }
                },
                apsara: {
                    $switch: {
                        branches: [
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediapicts"
                                    ]
                                },
                                then: "$mediapict.apsara"
                            },
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediadiaries"
                                    ]
                                },
                                then: "$mediadiaries.apsara"
                            },
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediavideos"
                                    ]
                                },
                                then: "$mediavideos.apsara"
                            }
                        ],
                        default: false
                    }
                },
            }
        },
            { $sort: { timestamp: -1 }, },);

        if (skip > 0) {
            pipeline.push({ $skip: skip });
        }

        if (limit > 0) {
            pipeline.push({ $limit: limit });
        }


        const query = await this.transactionsModel.aggregate(pipeline);

        var data = null;
        var arrdata = [];
        let pict: String[] = [];
        var objk = {};
        var type = null;
        var idapsara = null;
        var apsara = null;
        var idapsaradefine = null;
        var apsaradefine = null;
        for (var i = 0; i < query.length; i++) {
            try {
                idapsara = query[i].apsaraId;
            } catch (e) {
                idapsara = "";
            }
            try {
                apsara = query[i].apsara;
            } catch (e) {
                apsara = false;
            }
            var type = query[i].postType;
            pict = [idapsara];

            if (idapsara === "") {
                data = [];
            } else {
                if (type === "pict") {

                    try {
                        data = await this.postContentService.getImageApsara(pict);
                    } catch (e) {
                        data = [];
                    }
                }
                else if (type === "vid") {
                    try {
                        data = await this.postContentService.getVideoApsara(pict);
                    } catch (e) {
                        data = [];
                    }

                }
                else if (type === "story") {
                    try {
                        data = await this.postContentService.getVideoApsara(pict);
                    } catch (e) {
                        data = [];
                    }
                }
                else if (type === "diary") {
                    try {
                        data = await this.postContentService.getVideoApsara(pict);
                    } catch (e) {
                        data = [];
                    }
                }
            }

            if (apsara === undefined || apsara === "" || apsara === null || apsara === false) {
                apsaradefine = false;
            } else {
                apsaradefine = true;
            }

            if (idapsara === undefined || idapsara === "" || idapsara === null) {
                idapsaradefine = "";
            } else {
                idapsaradefine = idapsara;
            }
            objk = {
                "_id": query[i]._id,
                "iduser": query[i].iduser,
                "type": query[i].type,
                "jenis": query[i].jenis,
                "timestamp": query[i].timestamp,
                "description": query[i].description,
                "noinvoice": query[i].noinvoice,
                "nova": query[i].nova,
                "expiredtimeva": query[i].expiredtimeva,
                "salelike": query[i].salelike,
                "saleview": query[i].saleview,
                "bank": query[i].bank,
                "amount": query[i].amount,
                "totalamount": query[i].totalamount,
                "status": query[i].status,
                "fullName": query[i].fullName,
                "email": query[i].email,
                "penjual": query[i].penjual,
                "emailpenjual": query[i].emailpenjual,
                "postID": query[i].postID,
                "postType": query[i].postType,
                "descriptionContent": query[i].descriptionContent,
                "title": query[i].title,
                "mediaType": query[i].mediaType,
                "mediaEndpoint": query[i].mediaEndpoint,
                "apsaraId": idapsaradefine,
                "apsara": apsaradefine,
                "media": data
            };

            arrdata.push(objk);
        }
        return arrdata;

    }


    async findhistorySell(iduser: ObjectId, status: string, startdate: string, enddate: string, skip: number, limit: number) {

        var pipeline = [];

        if (status && status !== undefined) {
            pipeline.push({
                $match: {
                    status: status,

                }
            },);
        }


        if (startdate && startdate !== undefined) {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();

            pipeline.push({ $match: { timestamp: { "$gte": startdate } } });
        }
        if (enddate && enddate !== undefined) {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
            pipeline.push({ $match: { timestamp: { "$lte": dateend } } });

        }

        pipeline.push(
            {
                $match: {
                    idusersell: iduser,
                    type: { $ne: "BOOST_CONTENT" }
                }
            },
            {
                $addFields: {
                    type: 'Sell',
                    jenis: '$type'

                },
            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "idusersell",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            }, {
            $lookup: {
                from: "posts",
                localField: "postid",
                foreignField: "postID",
                as: "post_data"
            }
        }, {
            $lookup: {
                from: "mediapicts",
                localField: "post_data.contentMedias.$id",
                foreignField: "_id",
                as: "mediaPict_data"
            }
        }, {
            $lookup: {
                from: "mediadiaries",
                localField: "post_data.contentMedias.$id",
                foreignField: "_id",
                as: "mediadiaries_data"
            }
        }, {
            $lookup: {
                from: "mediavideos",
                localField: "post_data.contentMedias.$id",
                foreignField: "_id",
                as: "mediavideos_data"
            }
        },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "iduserbuyer",
                    foreignField: "_id",
                    as: "userbasics_buy"
                }
            },
            {
                $project: {
                    iduser: "$idusersell",
                    type: "$type",
                    jenis: "$jenis",
                    timestamp: "$timestamp",
                    description: "$description",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    status: "$status",
                    user: {
                        $arrayElemAt: [
                            "$userbasics_data",
                            0
                        ]
                    },
                    userbuy: {
                        $arrayElemAt: [
                            "$userbasics_buy",
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
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$user.fullName",
                email: "$user.email",
                pembeli: "$userbuy.fullName",
                emailpembeli: "$userbuy.email",
                postID: "$postdata.postID",
                postType: "$postdata.postType",
                descriptionContent: '$postdata.description',
                title: '$postdata.description',
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
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                pembeli: "$pembeli",
                emailpembeli: "$emailpembeli",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',
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
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                pembeli: "$pembeli",
                emailpembeli: "$emailpembeli",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',
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
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                pembeli: "$pembeli",
                emailpembeli: "$emailpembeli",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',
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
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                pembeli: "$pembeli",
                emailpembeli: "$emailpembeli",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',
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
                apsaraId: {
                    $switch: {
                        branches: [
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediapicts"
                                    ]
                                },
                                then: "$mediapict.apsaraId"
                            },
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediadiaries"
                                    ]
                                },
                                then: "$mediadiaries.apsaraId"
                            },
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediavideos"
                                    ]
                                },
                                then: "$mediavideos.apsaraId"
                            }
                        ],
                        default: ""
                    }
                },
                apsara: {
                    $switch: {
                        branches: [
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediapicts"
                                    ]
                                },
                                then: "$mediapict.apsara"
                            },
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediadiaries"
                                    ]
                                },
                                then: "$mediadiaries.apsara"
                            },
                            {
                                case: {
                                    $eq: [
                                        "$refs",
                                        "mediavideos"
                                    ]
                                },
                                then: "$mediavideos.apsara"
                            }
                        ],
                        default: false
                    }
                },
            }
        },
            { $sort: { timestamp: -1 }, },);

        if (skip > 0) {
            pipeline.push({ $skip: skip });
        }

        if (limit > 0) {
            pipeline.push({ $limit: limit });
        }


        const query = await this.transactionsModel.aggregate(pipeline);
        var data = null;
        var arrdata = [];
        let pict: String[] = [];
        var objk = {};
        var type = null;
        var idapsara = null;
        var apsara = null;
        var idapsaradefine = null;
        var apsaradefine = null;
        for (var i = 0; i < query.length; i++) {
            try {
                idapsara = query[i].apsaraId;
            } catch (e) {
                idapsara = "";
            }
            try {
                apsara = query[i].apsara;
            } catch (e) {
                apsara = false;
            }

            if (apsara === undefined || apsara === "" || apsara === null || apsara === false) {
                apsaradefine = false;
            } else {
                apsaradefine = true;
            }

            if (idapsara === undefined || idapsara === "" || idapsara === null) {
                idapsaradefine = "";
            } else {
                idapsaradefine = idapsara;
            }
            var type = query[i].postType;
            pict = [idapsara];

            if (idapsara === "") {
                data = [];
            } else {
                if (type === "pict") {

                    try {
                        data = await this.postContentService.getImageApsara(pict);
                    } catch (e) {
                        data = [];
                    }
                }
                else if (type === "vid") {
                    try {
                        data = await this.postContentService.getVideoApsara(pict);
                    } catch (e) {
                        data = [];
                    }

                }
                else if (type === "story") {
                    try {
                        data = await this.postContentService.getVideoApsara(pict);
                    } catch (e) {
                        data = [];
                    }
                }
                else if (type === "diary") {
                    try {
                        data = await this.postContentService.getVideoApsara(pict);
                    } catch (e) {
                        data = [];
                    }
                }
            }
            objk = {
                "_id": query[i]._id,
                "iduser": query[i].iduser,
                "type": query[i].type,
                "jenis": query[i].jenis,
                "timestamp": query[i].timestamp,
                "description": query[i].description,
                "noinvoice": query[i].noinvoice,
                "nova": query[i].nova,
                "expiredtimeva": query[i].expiredtimeva,
                "salelike": query[i].salelike,
                "saleview": query[i].saleview,
                "bank": query[i].bank,
                "amount": query[i].amount,
                "totalamount": query[i].totalamount,
                "status": query[i].status,
                "fullName": query[i].fullName,
                "email": query[i].email,
                "pembeli": query[i].pembeli,
                "emailpembeli": query[i].emailpembeli,
                "postID": query[i].postID,
                "postType": query[i].postType,
                "descriptionContent": query[i].descriptionContent,
                "title": query[i].title,
                "mediaType": query[i].mediaType,
                "mediaEndpoint": query[i].mediaEndpoint,
                "apsaraId": idapsaradefine,
                "apsara": apsaradefine,
                "media": data
            };

            arrdata.push(objk);
        }
        return arrdata;


    }

    async findhistorydetailsell(id: ObjectId, type: string, jenis: string, iduser: ObjectId) {
        const query = await this.transactionsModel.aggregate([


            {
                $addFields: {
                    type: 'Sell',
                    jenis: "$type",

                },
            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "idusersell",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            }, {
                $lookup: {
                    from: "posts",
                    localField: "postid",
                    foreignField: "postID",
                    as: "post_data"
                }
            }, {
                $lookup: {
                    from: "mediapicts",
                    localField: "post_data.contentMedias.$id",
                    foreignField: "_id",
                    as: "mediaPict_data"
                }
            }, {
                $lookup: {
                    from: "mediadiaries",
                    localField: "post_data.contentMedias.$id",
                    foreignField: "_id",
                    as: "mediadiaries_data"
                }
            }, {
                $lookup: {
                    from: "mediavideos",
                    localField: "post_data.contentMedias.$id",
                    foreignField: "_id",
                    as: "mediavideos_data"
                }
            }, {
                $project: {
                    idusersell: "$idusersell",
                    iduserbuyer: "$iduserbuyer",
                    type: "$type",
                    jenis: "$jenis",
                    timestamp: "$timestamp",
                    description: "$description",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    status: "$status",
                    paymentmethod: "$paymentmethod",
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
                    idusersell: "$idusersell",
                    iduserbuyer: "$iduserbuyer",
                    type: "$type",
                    jenis: "$jenis",
                    timestamp: "$timestamp",
                    description: "$description",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    status: "$status",
                    paymentmethod: "$paymentmethod",
                    fullName: "$user.fullName",
                    email: "$user.email",
                    postID: "$postdata.postID",
                    postType: "$postdata.postType",
                    likes: "$postdata.likes",
                    views: "$postdata.views",
                    shares: "$postdata.shares",
                    descriptionContent: '$postdata.description',
                    title: '$postdata.description',
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
                    idusersell: "$idusersell",
                    iduserbuyer: "$iduserbuyer",
                    type: "$type",
                    jenis: "$jenis",
                    timestamp: "$timestamp",
                    description: "$description",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    status: "$status",
                    paymentmethod: "$paymentmethod",
                    fullName: "$fullName",
                    email: "$email",
                    postID: "$postID",
                    postType: "$postType",
                    likes: "$likes",
                    views: "$views",
                    shares: "$shares",
                    descriptionContent: '$descriptionContent',
                    title: '$title',
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
                    idusersell: "$idusersell",
                    iduserbuyer: "$iduserbuyer",
                    type: "$type",
                    jenis: "$jenis",
                    timestamp: "$timestamp",
                    description: "$description",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    status: "$status",
                    paymentmethod: "$paymentmethod",
                    fullName: "$fullName",
                    email: "$email",
                    postID: "$postID",
                    postType: "$postType",
                    likes: "$likes",
                    views: "$views",
                    shares: "$shares",
                    descriptionContent: '$descriptionContent',
                    title: '$title',
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
                    idusersell: "$idusersell",
                    iduserbuyer: "$iduserbuyer",
                    type: "$type",
                    jenis: "$jenis",
                    timestamp: "$timestamp",
                    description: "$description",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    status: "$status",
                    paymentmethod: "$paymentmethod",
                    fullName: "$fullName",
                    email: "$email",
                    postID: "$postID",
                    postType: "$postType",
                    likes: "$likes",
                    views: "$views",
                    shares: "$shares",
                    descriptionContent: '$descriptionContent',
                    title: '$title',
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

                    idusersell: "$idusersell",
                    iduserbuyer: "$iduserbuyer",
                    type: "$type",
                    jenis: "$jenis",
                    timestamp: "$timestamp",
                    description: "$description",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    status: "$status",
                    paymentmethod: "$paymentmethod",
                    fullName: "$fullName",
                    email: "$email",
                    postID: "$postID",
                    postType: "$postType",
                    likes: "$likes",
                    views: "$views",
                    shares: "$shares",
                    descriptionContent: '$descriptionContent',
                    title: '$title',
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
                    apsaraId: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediapicts"
                                        ]
                                    },
                                    then: "$mediapict.apsaraId"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediadiaries"
                                        ]
                                    },
                                    then: "$mediadiaries.apsaraId"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediavideos"
                                        ]
                                    },
                                    then: "$mediavideos.apsaraId"
                                }
                            ],
                            default: ""
                        }
                    },
                    apsara: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediapicts"
                                        ]
                                    },
                                    then: "$mediapict.apsara"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediadiaries"
                                        ]
                                    },
                                    then: "$mediadiaries.apsara"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediavideos"
                                        ]
                                    },
                                    then: "$mediavideos.apsara"
                                }
                            ],
                            default: false
                        }
                    },
                }
            },
            {
                $match: {
                    _id: id, type: type, jenis: jenis, idusersell: iduser
                }
            },

        ]);
        return query;
    }

    async findhistorydetailbuy(id: ObjectId, type: string, jenis: string, iduser: ObjectId) {
        const query = await this.transactionsModel.aggregate([


            {
                $addFields: {
                    type: 'Buy',
                    jenis: "$type",

                },
            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "iduserbuyer",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            }, {
                $lookup: {
                    from: "posts",
                    localField: "postid",
                    foreignField: "postID",
                    as: "post_data"
                }
            }, {
                $lookup: {
                    from: "mediapicts",
                    localField: "post_data.contentMedias.$id",
                    foreignField: "_id",
                    as: "mediaPict_data"
                }
            }, {
                $lookup: {
                    from: "mediadiaries",
                    localField: "post_data.contentMedias.$id",
                    foreignField: "_id",
                    as: "mediadiaries_data"
                }
            }, {
                $lookup: {
                    from: "mediavideos",
                    localField: "post_data.contentMedias.$id",
                    foreignField: "_id",
                    as: "mediavideos_data"
                }
            }, {
                $project: {
                    idusersell: "$idusersell",
                    iduserbuyer: "$iduserbuyer",
                    type: "$type",
                    jenis: "$jenis",
                    timestamp: "$timestamp",
                    description: "$description",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    status: "$status",
                    paymentmethod: "$paymentmethod",
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
                    idusersell: "$idusersell",
                    iduserbuyer: "$iduserbuyer",
                    type: "$type",
                    jenis: "$jenis",
                    timestamp: "$timestamp",
                    description: "$description",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    status: "$status",
                    paymentmethod: "$paymentmethod",
                    fullName: "$user.fullName",
                    email: "$user.email",
                    postID: "$postdata.postID",
                    postType: "$postdata.postType",
                    likes: "$postdata.likes",
                    views: "$postdata.views",
                    shares: "$postdata.shares",
                    descriptionContent: '$postdata.description',
                    title: '$postdata.description',
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
                    idusersell: "$idusersell",
                    iduserbuyer: "$iduserbuyer",
                    type: "$type",
                    jenis: "$jenis",
                    timestamp: "$timestamp",
                    description: "$description",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    status: "$status",
                    paymentmethod: "$paymentmethod",
                    fullName: "$fullName",
                    email: "$email",
                    postID: "$postID",
                    postType: "$postType",
                    likes: "$likes",
                    views: "$views",
                    shares: "$shares",
                    descriptionContent: '$descriptionContent',
                    title: '$title',
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
                    idusersell: "$idusersell",
                    iduserbuyer: "$iduserbuyer",
                    type: "$type",
                    jenis: "$jenis",
                    timestamp: "$timestamp",
                    description: "$description",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    status: "$status",
                    paymentmethod: "$paymentmethod",
                    fullName: "$fullName",
                    email: "$email",
                    postID: "$postID",
                    postType: "$postType",
                    likes: "$likes",
                    views: "$views",
                    shares: "$shares",
                    descriptionContent: '$descriptionContent',
                    title: '$title',
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
                    idusersell: "$idusersell",
                    iduserbuyer: "$iduserbuyer",
                    type: "$type",
                    jenis: "$jenis",
                    timestamp: "$timestamp",
                    description: "$description",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    status: "$status",
                    paymentmethod: "$paymentmethod",
                    fullName: "$fullName",
                    email: "$email",
                    postID: "$postID",
                    postType: "$postType",
                    likes: "$likes",
                    views: "$views",
                    shares: "$shares",
                    descriptionContent: '$descriptionContent',
                    title: '$title',
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

                    idusersell: "$idusersell",
                    iduserbuyer: "$iduserbuyer",
                    type: "$type",
                    jenis: "$jenis",
                    timestamp: "$timestamp",
                    description: "$description",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    status: "$status",
                    paymentmethod: "$paymentmethod",
                    fullName: "$fullName",
                    email: "$email",
                    postID: "$postID",
                    postType: "$postType",
                    likes: "$likes",
                    views: "$views",
                    shares: "$shares",
                    descriptionContent: '$descriptionContent',
                    title: '$title',
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
                    apsaraId: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediapicts"
                                        ]
                                    },
                                    then: "$mediapict.apsaraId"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediadiaries"
                                        ]
                                    },
                                    then: "$mediadiaries.apsaraId"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediavideos"
                                        ]
                                    },
                                    then: "$mediavideos.apsaraId"
                                }
                            ],
                            default: ""
                        }
                    },
                    apsara: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediapicts"
                                        ]
                                    },
                                    then: "$mediapict.apsara"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediadiaries"
                                        ]
                                    },
                                    then: "$mediadiaries.apsara"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediavideos"
                                        ]
                                    },
                                    then: "$mediavideos.apsara"
                                }
                            ],
                            default: false
                        }
                    },
                }
            },
            {
                $match: {
                    _id: id, type: type, jenis: jenis, iduserbuyer: iduser
                }
            },

        ]);
        return query;
    }

    async findtransactionvoucher(id: ObjectId, type: string, jenis: string, iduser: ObjectId) {

        const query = await this.transactionsModel.aggregate([

            {
                $addFields: {
                    type: 'Buy',
                    jenis: "$type",

                },
            },

            {
                $lookup: {
                    from: "userbasics",
                    localField: "iduserbuyer",
                    foreignField: "_id",
                    as: "user_data"
                }
            }, {
                $lookup: {
                    from: "uservouchers",
                    localField: "detail.id",
                    foreignField: "voucherID",
                    as: "user_voucher"
                }
            },
            {
                $match: {
                    _id: id,
                    type: type,
                    jenis: jenis,
                    iduserbuyer: iduser
                }
            },
        ]);

        return query;

    }

    async findhistoryBuyVoucher(key: string, iduser: ObjectId, status: any[], startdate: string, enddate: string, page: number, limit: number, descending: boolean, startday: number, endday: number, used: boolean, expired: boolean) {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }


        var currdate = new Date();

        var dt = currdate.toISOString();
        var split = dt.split('T');
        var datenew = split[0];


        var order = null;

        if (descending === true) {
            order = -1;
        } else {
            order = 1;
        }

        var pipeline = [];
        pipeline.push({
            $match: {

                type: "VOUCHER",

            }
        },);



        if (iduser && iduser !== undefined) {
            pipeline.push({
                $match: {
                    iduserbuyer: iduser
                }
            },);
        }

        if (status && status !== undefined) {
            pipeline.push({
                $match: {


                    status: {
                        $in: status
                    },

                }
            },);
        }

        if (startdate && startdate !== undefined) {

            pipeline.push({ $match: { timestamp: { "$gte": startdate } } });

        }
        if (enddate && enddate !== undefined) {

            pipeline.push({ $match: { timestamp: { "$lte": dateend } } });

        }

        pipeline.push(
            {
                $match: {

                    'type': "VOUCHER"
                }
            },
            {
                $addFields: {
                    type: 'Buy',
                    jenis: "$type",
                    idvoucher: '$detail.id'
                },

            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "iduserbuyer",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            },
            {
                "$lookup": {
                    from: "vouchers",
                    as: "voucher_data",
                    let: {
                        local_id: '$idvoucher'
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
                            "$lookup": {
                                from: "uservouchers",
                                as: "uservoucherdata",
                                let: {
                                    local_id: '$_id'
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {


                                            $expr: {
                                                $eq: ['$voucherID', '$$local_id']
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $set: {
                                "testDate": {
                                    $add: [new Date(), 25200000]
                                }
                            }
                        },
                        {
                            $project: {
                                "noVoucher": 1,
                                "codeVoucher": 1,
                                "userID": 1,
                                "nameAds": "tes",
                                "creditValue": 1,
                                "creditPromo": 1,
                                "creditTotal": 1,
                                "createdAt": 1,
                                "expiredAt": 1,
                                "amount": 1,
                                "qty": 1,
                                "totalUsed": 1,
                                "pendingUsed": 1,
                                "expiredDay": 1,
                                "isActive": 1,
                                "description": 1,
                                "updatedAt": 1,
                                "testDate": 1,
                                "statusUsed": {
                                    $cond: {
                                        if: {
                                            $or: [{
                                                $eq: ["$uservoucherdata", null]
                                            }, {
                                                $eq: ["$uservoucherdata", ""]
                                            }, {
                                                $eq: ["$uservoucherdata", []]
                                            }, {
                                                $eq: ["$uservoucherdata", 0]
                                            }]
                                        },
                                        then: "NOTUSED",
                                        else: "USED"
                                    },

                                },


                            }
                        }
                    ],

                }
            },
            {
                $project: {
                    iduser: "$iduserbuyer",
                    type: 1,
                    jenis: 1,
                    timestamp: 1,
                    description: 1,
                    noinvoice: 1,
                    nova: 1,
                    expiredtimeva: 1,
                    salelike: 1,
                    saleview: 1,
                    bank: 1,
                    amount: 1,
                    totalamount: 1,
                    status: 1,
                    user: {
                        $arrayElemAt: [
                            "$userbasics_data",
                            0
                        ]
                    },
                    vcdata: "$voucher_data"
                }
            },
            {
                $project: {

                    iduser: 1,
                    type: 1,
                    jenis: 1,
                    timestamp: 1,
                    description: 1,
                    noinvoice: 1,
                    nova: 1,
                    expiredtimeva: 1,
                    salelike: 1,
                    saleview: 1,
                    bank: 1,
                    amount: 1,
                    totalamount: 1,
                    status: 1,
                    fullName: "$user.fullName",
                    email: "$user.email",
                    vcdata: 1
                }
            },
            {
                $project: {

                    iduser: 1,
                    type: 1,
                    jenis: 1,
                    timestamp: 1,
                    description: 1,
                    noinvoice: 1,
                    nova: 1,
                    expiredtimeva: 1,
                    salelike: 1,
                    saleview: 1,
                    bank: 1,
                    amount: 1,
                    totalamount: 1,
                    status: 1,
                    fullName: "$user.fullName",
                    email: "$user.email",
                    vcdata: 1,
                    uservoucher: '$uservoucherdata'
                }
            },);
        if (expired && expired !== true) {
            pipeline.push({
                $match: {
                    'vcdata.expiredAt': {
                        '$gt': datenew
                    }

                }
            },);
        } else {
            pipeline.push({
                $match: {
                    'vcdata.expiredAt': {
                        '$lt': datenew
                    }

                }
            },);
        }

        if (key && key !== undefined) {
            pipeline.push({
                $match: {

                    'vcdata.nameAds': {
                        $regex: key,
                        $options: 'i'
                    },

                }
            },);
        }

        if (startday && startday !== undefined) {
            pipeline.push({ $match: { 'vcdata.expiredDay': { "$gte": startday } } });
        }
        if (endday && endday !== undefined) {
            pipeline.push({ $match: { 'vcdata.expiredDay': { "$lte": endday } } });
        }

        if (used && used === true) {
            pipeline.push({
                $match: {

                    'vcdata.statusUsed': "USED"

                }
            },);
        }






        pipeline.push({
            $sort: {
                timestamp: order
            },

        });

        if (page > 0) {
            pipeline.push({ $skip: (page * limit) });
        }
        if (limit > 0) {
            pipeline.push({ $limit: limit });
        }
        let query = await this.transactionsModel.aggregate(pipeline);

        return query;





    }
    async findhistoryBuyVoucherCount(key: string, iduser: ObjectId, status: any[], startdate: string, enddate: string) {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }
        if (key !== undefined && iduser === undefined && status === undefined && startdate === undefined && enddate === undefined) {
            const query = await this.transactionsModel.aggregate([
                {
                    $match: {

                        type: "VOUCHER",
                        noinvoice: {
                            $regex: key,
                            $options: 'i'
                        },

                    }
                },
                {
                    $addFields: {
                        type: 'Buy',
                        jenis: "$type",

                    },

                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "iduserbuyer",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },
                {
                    $lookup: {
                        from: "vouchers",
                        localField: "detail.id",
                        foreignField: "_id",
                        as: "voucher_data"
                    }
                },
                {
                    $project: {
                        iduser: "$iduserbuyer",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        vcdata: "$voucher_data"
                    }
                },
                {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        vcdata: "$vcdata"
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },

            ]);

            return query;
        }
        else if (key !== undefined && iduser !== undefined && status === undefined && startdate === undefined && enddate === undefined) {
            const query = await this.transactionsModel.aggregate([
                {
                    $match: {

                        type: "VOUCHER",
                        noinvoice: {
                            $regex: key,
                            $options: 'i'
                        },
                        iduserbuyer: iduser
                    }
                },
                {
                    $addFields: {
                        type: 'Buy',
                        jenis: "$type",

                    },

                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "iduserbuyer",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },
                {
                    $lookup: {
                        from: "vouchers",
                        localField: "detail.id",
                        foreignField: "_id",
                        as: "voucher_data"
                    }
                },
                {
                    $project: {
                        iduser: "$iduserbuyer",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        vcdata: "$voucher_data"
                    }
                },
                {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        vcdata: "$vcdata"
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },

            ]);

            return query;
        }
        else if (key === undefined && iduser === undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
            const query = await this.transactionsModel.aggregate([
                {
                    $match: {

                        type: "VOUCHER",
                        timestamp: {
                            $gte: startdate,
                            $lte: dateend
                        }
                    }
                },
                {
                    $addFields: {
                        type: 'Buy',
                        jenis: "$type",

                    },

                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "iduserbuyer",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },
                {
                    $lookup: {
                        from: "vouchers",
                        localField: "detail.id",
                        foreignField: "_id",
                        as: "voucher_data"
                    }
                },
                {
                    $project: {
                        iduser: "$iduserbuyer",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        vcdata: "$voucher_data"
                    }
                },
                {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        vcdata: "$vcdata"
                    }
                },
                {
                    $sort: {
                        timestamp: -1
                    },

                },

            ]);

            return query;
        }
        else if (key === undefined && iduser !== undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
            const query = await this.transactionsModel.aggregate([
                {
                    $match: {

                        type: "VOUCHER",
                        timestamp: {
                            $gte: startdate,
                            $lte: dateend
                        },
                        iduserbuyer: iduser
                    }
                },
                {
                    $addFields: {
                        type: 'Buy',
                        jenis: "$type",

                    },

                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "iduserbuyer",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },
                {
                    $lookup: {
                        from: "vouchers",
                        localField: "detail.id",
                        foreignField: "_id",
                        as: "voucher_data"
                    }
                },
                {
                    $project: {
                        iduser: "$iduserbuyer",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        vcdata: "$voucher_data"
                    }
                },
                {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        vcdata: "$vcdata"
                    }
                },
                {
                    $sort: {
                        timestamp: -1
                    },

                },

            ]);

            return query;
        }
        else if (key === undefined && iduser !== undefined && status !== undefined && startdate === undefined && enddate === undefined) {
            const query = await this.transactionsModel.aggregate([
                {
                    $match: {

                        type: "VOUCHER",
                        status: {
                            $in: status
                        },
                        iduserbuyer: iduser
                    }
                },
                {
                    $addFields: {
                        type: 'Buy',
                        jenis: "$type",

                    },

                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "iduserbuyer",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },
                {
                    $lookup: {
                        from: "vouchers",
                        localField: "detail.id",
                        foreignField: "_id",
                        as: "voucher_data"
                    }
                },
                {
                    $project: {
                        iduser: "$iduserbuyer",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        vcdata: "$voucher_data"
                    }
                },
                {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        vcdata: "$vcdata"
                    }
                },
                {
                    $sort: {
                        timestamp: -1
                    },

                },

            ]);

            return query;
        }
        else if (key !== undefined && iduser !== undefined && status !== undefined && startdate === undefined && enddate === undefined) {
            const query = await this.transactionsModel.aggregate([
                {
                    $match: {

                        type: "VOUCHER",
                        noinvoice: {
                            $regex: key, $options: 'i'
                        },
                        status: {
                            $in: status
                        },
                        iduserbuyer: iduser
                    }
                },
                {
                    $addFields: {
                        type: 'Buy',
                        jenis: "$type",

                    },

                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "iduserbuyer",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },
                {
                    $lookup: {
                        from: "vouchers",
                        localField: "detail.id",
                        foreignField: "_id",
                        as: "voucher_data"
                    }
                },
                {
                    $project: {
                        iduser: "$iduserbuyer",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        vcdata: "$voucher_data"
                    }
                },
                {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        vcdata: "$vcdata"
                    }
                },
                {
                    $sort: {
                        timestamp: -1
                    },

                },

            ]);

            return query;
        }
        else if (key === undefined && iduser !== undefined && status === undefined && startdate === undefined && enddate === undefined) {
            const query = await this.transactionsModel.aggregate([
                {
                    $match: {

                        type: "VOUCHER",
                        iduserbuyer: iduser
                    }
                },
                {
                    $addFields: {
                        type: 'Buy',
                        jenis: "$type",

                    },

                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "iduserbuyer",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },
                {
                    $lookup: {
                        from: "vouchers",
                        localField: "detail.id",
                        foreignField: "_id",
                        as: "voucher_data"
                    }
                },
                {
                    $project: {
                        iduser: "$iduserbuyer",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        vcdata: "$voucher_data"
                    }
                },
                {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        vcdata: "$vcdata"
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },

            ]);

            return query;
        }
        else if (key !== undefined && iduser === undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
            const query = await this.transactionsModel.aggregate([
                {
                    $match: {

                        type: "VOUCHER",
                        noinvoice: {
                            $regex: key, $options: 'i'
                        },
                        timestamp: {
                            $gte: startdate,
                            $lte: dateend
                        }
                    }
                },
                {
                    $addFields: {
                        type: 'Buy',
                        jenis: "$type",

                    },

                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "iduserbuyer",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },
                {
                    $lookup: {
                        from: "vouchers",
                        localField: "detail.id",
                        foreignField: "_id",
                        as: "voucher_data"
                    }
                },
                {
                    $project: {
                        iduser: "$iduserbuyer",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        vcdata: "$voucher_data"
                    }
                },
                {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        vcdata: "$vcdata"
                    }
                },
                {
                    $sort: {
                        timestamp: -1
                    },

                },

            ]);

            return query;
        }
        else if (key === undefined && iduser === undefined && status !== undefined && startdate !== undefined && enddate !== undefined) {
            const query = await this.transactionsModel.aggregate([
                {
                    $match: {

                        type: "VOUCHER",
                        status: {
                            $in: status
                        },
                        timestamp: {
                            $gte: startdate,
                            $lte: dateend
                        }
                    }
                },
                {
                    $addFields: {
                        type: 'Buy',
                        jenis: "$type",

                    },

                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "iduserbuyer",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },
                {
                    $lookup: {
                        from: "vouchers",
                        localField: "detail.id",
                        foreignField: "_id",
                        as: "voucher_data"
                    }
                },
                {
                    $project: {
                        iduser: "$iduserbuyer",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        vcdata: "$voucher_data"
                    }
                },
                {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        vcdata: "$vcdata"
                    }
                },
                {
                    $sort: {
                        timestamp: -1
                    },

                },

            ]);

            return query;
        }
        else if (key === undefined && iduser !== undefined && status !== undefined && startdate !== undefined && enddate !== undefined) {
            const query = await this.transactionsModel.aggregate([
                {
                    $match: {

                        type: "VOUCHER",
                        status: {
                            $in: status
                        },
                        timestamp: {
                            $gte: startdate,
                            $lte: dateend
                        },
                        iduserbuyer: iduser
                    }
                },
                {
                    $addFields: {
                        type: 'Buy',
                        jenis: "$type",

                    },

                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "iduserbuyer",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },
                {
                    $lookup: {
                        from: "vouchers",
                        localField: "detail.id",
                        foreignField: "_id",
                        as: "voucher_data"
                    }
                },
                {
                    $project: {
                        iduser: "$iduserbuyer",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        vcdata: "$voucher_data"
                    }
                },
                {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        vcdata: "$vcdata"
                    }
                },
                {
                    $sort: {
                        timestamp: -1
                    },

                },

            ]);

            return query;
        }
        else if (key !== undefined && iduser === undefined && status !== undefined && startdate !== undefined && enddate !== undefined) {
            const query = await this.transactionsModel.aggregate([
                {
                    $match: {

                        type: "VOUCHER",
                        noinvoice: {
                            $regex: key, $options: 'i'
                        },
                        status: {
                            $in: status
                        },
                        timestamp: {
                            $gte: startdate,
                            $lte: dateend
                        }
                    }
                },
                {
                    $addFields: {
                        type: 'Buy',
                        jenis: "$type",

                    },

                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "iduserbuyer",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },
                {
                    $lookup: {
                        from: "vouchers",
                        localField: "detail.id",
                        foreignField: "_id",
                        as: "voucher_data"
                    }
                },
                {
                    $project: {
                        iduser: "$iduserbuyer",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        vcdata: "$voucher_data"
                    }
                },
                {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        vcdata: "$vcdata"
                    }
                },
                {
                    $sort: {
                        timestamp: -1
                    },

                },

            ]);

            return query;
        }
        else if (key !== undefined && iduser !== undefined && status !== undefined && startdate !== undefined && enddate !== undefined) {
            const query = await this.transactionsModel.aggregate([
                {
                    $match: {

                        type: "VOUCHER",
                        noinvoice: {
                            $regex: key, $options: 'i'
                        },
                        status: {
                            $in: status
                        },
                        timestamp: {
                            $gte: startdate,
                            $lte: dateend
                        },
                        iduserbuyer: iduser
                    }
                },
                {
                    $addFields: {
                        type: 'Buy',
                        jenis: "$type",

                    },

                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "iduserbuyer",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },
                {
                    $lookup: {
                        from: "vouchers",
                        localField: "detail.id",
                        foreignField: "_id",
                        as: "voucher_data"
                    }
                },
                {
                    $project: {
                        iduser: "$iduserbuyer",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        vcdata: "$voucher_data"
                    }
                },
                {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        vcdata: "$vcdata"
                    }
                },
                {
                    $sort: {
                        timestamp: -1
                    },

                },

            ]);

            return query;
        }
        else {
            const query = await this.transactionsModel.aggregate([
                {
                    $match: {

                        type: "VOUCHER"
                    }
                },
                {
                    $addFields: {
                        type: 'Buy',
                        jenis: "$type",

                    },

                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "iduserbuyer",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },
                {
                    $lookup: {
                        from: "vouchers",
                        localField: "detail.id",
                        foreignField: "_id",
                        as: "voucher_data"
                    }
                },
                {
                    $project: {
                        iduser: "$iduserbuyer",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        vcdata: "$voucher_data"
                    }
                },
                {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        vcdata: "$vcdata"
                    }
                },
                {
                    $sort: {
                        timestamp: -1
                    },

                },

            ]);

            return query;
        }



    }
    async findtransactiondetailvoucher(id: ObjectId) {

        const query = await this.transactionsModel.aggregate([

            {
                $match: {

                    type: "VOUCHER",
                    _id: id
                }
            },
            // {
            //     $lookup: {
            //         from: "vouchers",
            //         localField: "detail.id",
            //         foreignField: "_id",
            //         as: "voucher_data"
            //     }
            // },
            {
                $addFields: {
                    type: 'Buy',
                    jenis: "$type",

                },

            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "iduserbuyer",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "iduserbuyer",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            },
            {
                $project: {
                    iduser: "$iduserbuyer",
                    type: "$type",
                    jenis: "$jenis",
                    timestamp: "$timestamp",
                    description: "$description",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    status: "$status",
                    detail: "$detail",
                    // voucher_data: "$voucher_data",
                    user: {
                        $arrayElemAt: [
                            "$userbasics_data",
                            0
                        ]
                    },

                }
            },
            {
                $project: {

                    iduser: "$iduser",
                    type: "$type",
                    jenis: "$jenis",
                    timestamp: "$timestamp",
                    description: "$description",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    status: "$status",
                    fullName: "$user.fullName",
                    email: "$user.email",
                    detail: "$detail",
                    //  voucher_data: "$voucher_data",
                }
            },

        ]);

        return query;

    }
    async totalcountVoucher() {
        const query = await this.transactionsModel.aggregate([

            {
                $match: {

                    type: "VOUCHER"
                }
            },
            {
                $group: {
                    _id: null,
                    countrow: {
                        $sum: 1
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }]);
        return query;
    }

    async findhistorySeller(iduser: ObjectId, status: string, startdate: string, enddate: string, skip: number, limit: number) {

        var pipeline = new Array<any>(
            {
                $addFields: {
                    type: 'Sell',
                    jenis: '$type'

                },
            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "idusersell",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            }, {
            $lookup: {
                from: "posts",
                localField: "postid",
                foreignField: "postID",
                as: "post_data"
            }
        },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "iduserbuyer",
                    foreignField: "_id",
                    as: "userbasics_buy"
                }
            },
            {
                $project: {
                    iduser: "$idusersell",
                    type: "$type",
                    jenis: "$jenis",
                    timestamp: "$timestamp",
                    description: "$description",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    status: "$status",
                    user: {
                        $arrayElemAt: [
                            "$userbasics_data",
                            0
                        ]
                    },
                    userbuy: {
                        $arrayElemAt: [
                            "$userbasics_buy",
                            0
                        ]
                    },
                    postdata: {
                        $arrayElemAt: [
                            "$post_data",
                            0
                        ]
                    },

                }
            }, {
            $project: {
                contentMedias: "$postdata.contentMedias",
                iduser: "$iduser",
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$user.fullName",
                email: "$user.email",
                pembeli: "$userbuy.fullName",
                emailpembeli: "$userbuy.email",
                postID: "$postdata.postID",
                postType: "$postdata.postType",
                descriptionContent: '$postdata.description',
                title: '$postdata.description',

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
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                pembeli: "$pembeli",
                emailpembeli: "$emailpembeli",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',

            }
        }, {
            $project: {
                refs: "$refs.$ref",
                iduser: "$iduser",
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                pembeli: "$pembeli",
                emailpembeli: "$emailpembeli",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',

            }
        }, {
            $project: {
                refs: "$refs",
                iduser: "$iduser",
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                pembeli: "$pembeli",
                emailpembeli: "$emailpembeli",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',

            }
        }, {
            $project: {

                iduser: "$iduser",
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                pembeli: "$pembeli",
                emailpembeli: "$emailpembeli",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',

            }
        }
        );
        if (status !== undefined) {
            pipeline.push({
                $match: {
                    status: status
                }
            });
        }
        if (startdate !== undefined) {
            pipeline.push({
                $match: {
                    timestamp: { $gte: startdate }
                }
            });
        }
        if (enddate !== undefined) {
            pipeline.push({
                $match: {
                    timestamp: { $lte: enddate }
                }
            });
        }
        pipeline.push({
            $match: {
                idusersell: iduser
            }
        });
        pipeline.push({ $sort: { timestamp: -1 } });
        if (skip > 0) {
            pipeline.push({
                $skip: skip
            });
        }
        if (limit > 0) {
            pipeline.push({
                $limit: limit
            });
        }

        const query = await this.transactionsModel.aggregate(pipeline);

        return query;
    }
    async findhistorySellercount(iduser: ObjectId, status: string, startdate: string, enddate: string) {


        if (startdate !== undefined && enddate !== undefined && status !== undefined) {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
            const query = await this.transactionsModel.aggregate([
                {
                    $match: {
                        status: status,
                        idusersell: iduser,
                        timestamp: { $gte: startdate, $lte: dateend }

                    }
                },

                {
                    $addFields: {
                        type: 'Sell',
                        jenis: '$type'

                    },
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "idusersell",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $lookup: {
                        from: "posts",
                        localField: "postid",
                        foreignField: "postID",
                        as: "post_data"
                    }
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "iduserbuyer",
                        foreignField: "_id",
                        as: "userbasics_buy"
                    }
                },
                {
                    $project: {
                        iduser: "$idusersell",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        userbuy: {
                            $arrayElemAt: [
                                "$userbasics_buy",
                                0
                            ]
                        },
                        postdata: {
                            $arrayElemAt: [
                                "$post_data",
                                0
                            ]
                        },

                    }
                }, {
                    $project: {
                        contentMedias: "$postdata.contentMedias",
                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        pembeli: "$userbuy.fullName",
                        emailpembeli: "$userbuy.email",
                        postID: "$postdata.postID",
                        postType: "$postdata.postType",
                        descriptionContent: '$postdata.description',
                        title: '$postdata.description',

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
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        pembeli: "$pembeli",
                        emailpembeli: "$emailpembeli",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {
                        refs: "$refs.$ref",
                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        pembeli: "$pembeli",
                        emailpembeli: "$emailpembeli",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {
                        refs: "$refs",
                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        pembeli: "$pembeli",
                        emailpembeli: "$emailpembeli",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        pembeli: "$pembeli",
                        emailpembeli: "$emailpembeli",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                },
                { $sort: { timestamp: -1 }, },

            ]);

            return query;
        }
        else if (startdate !== undefined && enddate !== undefined && status === undefined) {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
            const query = await this.transactionsModel.aggregate([
                {
                    $match: {

                        idusersell: iduser,
                        timestamp: { $gte: startdate, $lte: dateend }

                    }
                },

                {
                    $addFields: {
                        type: 'Sell',
                        jenis: '$type'

                    },
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "idusersell",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $lookup: {
                        from: "posts",
                        localField: "postid",
                        foreignField: "postID",
                        as: "post_data"
                    }
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "iduserbuyer",
                        foreignField: "_id",
                        as: "userbasics_buy"
                    }
                },
                {
                    $project: {
                        iduser: "$idusersell",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        userbuy: {
                            $arrayElemAt: [
                                "$userbasics_buy",
                                0
                            ]
                        },
                        postdata: {
                            $arrayElemAt: [
                                "$post_data",
                                0
                            ]
                        },

                    }
                }, {
                    $project: {
                        contentMedias: "$postdata.contentMedias",
                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        pembeli: "$userbuy.fullName",
                        emailpembeli: "$userbuy.email",
                        postID: "$postdata.postID",
                        postType: "$postdata.postType",
                        descriptionContent: '$postdata.description',
                        title: '$postdata.description',

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
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        pembeli: "$pembeli",
                        emailpembeli: "$emailpembeli",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {
                        refs: "$refs.$ref",
                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        pembeli: "$pembeli",
                        emailpembeli: "$emailpembeli",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {
                        refs: "$refs",
                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        pembeli: "$pembeli",
                        emailpembeli: "$emailpembeli",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        pembeli: "$pembeli",
                        emailpembeli: "$emailpembeli",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                },
                { $sort: { timestamp: -1 }, },

            ]);

            return query;
        }
        else if (startdate === undefined && enddate === undefined && status !== undefined) {

            const query = await this.transactionsModel.aggregate([
                {
                    $match: {

                        idusersell: iduser,
                        status: status,

                    }
                },

                {
                    $addFields: {
                        type: 'Sell',
                        jenis: '$type'

                    },
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "idusersell",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $lookup: {
                        from: "posts",
                        localField: "postid",
                        foreignField: "postID",
                        as: "post_data"
                    }
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "iduserbuyer",
                        foreignField: "_id",
                        as: "userbasics_buy"
                    }
                },
                {
                    $project: {
                        iduser: "$idusersell",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        userbuy: {
                            $arrayElemAt: [
                                "$userbasics_buy",
                                0
                            ]
                        },
                        postdata: {
                            $arrayElemAt: [
                                "$post_data",
                                0
                            ]
                        },

                    }
                }, {
                    $project: {
                        contentMedias: "$postdata.contentMedias",
                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        pembeli: "$userbuy.fullName",
                        emailpembeli: "$userbuy.email",
                        postID: "$postdata.postID",
                        postType: "$postdata.postType",
                        descriptionContent: '$postdata.description',
                        title: '$postdata.description',

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
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        pembeli: "$pembeli",
                        emailpembeli: "$emailpembeli",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {
                        refs: "$refs.$ref",
                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        pembeli: "$pembeli",
                        emailpembeli: "$emailpembeli",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {
                        refs: "$refs",
                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        pembeli: "$pembeli",
                        emailpembeli: "$emailpembeli",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        pembeli: "$pembeli",
                        emailpembeli: "$emailpembeli",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                },
                { $sort: { timestamp: -1 }, },

            ]);

            return query;
        }
        else {
            const query = await this.transactionsModel.aggregate([
                {
                    $match: {

                        idusersell: iduser

                    }
                },

                {
                    $addFields: {
                        type: 'Sell',
                        jenis: '$type'

                    },
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "idusersell",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $lookup: {
                        from: "posts",
                        localField: "postid",
                        foreignField: "postID",
                        as: "post_data"
                    }
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "iduserbuyer",
                        foreignField: "_id",
                        as: "userbasics_buy"
                    }
                },
                {
                    $project: {
                        iduser: "$idusersell",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        userbuy: {
                            $arrayElemAt: [
                                "$userbasics_buy",
                                0
                            ]
                        },
                        postdata: {
                            $arrayElemAt: [
                                "$post_data",
                                0
                            ]
                        },

                    }
                }, {
                    $project: {
                        contentMedias: "$postdata.contentMedias",
                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        pembeli: "$userbuy.fullName",
                        emailpembeli: "$userbuy.email",
                        postID: "$postdata.postID",
                        postType: "$postdata.postType",
                        descriptionContent: '$postdata.description',
                        title: '$postdata.description',

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
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        pembeli: "$pembeli",
                        emailpembeli: "$emailpembeli",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {
                        refs: "$refs.$ref",
                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        pembeli: "$pembeli",
                        emailpembeli: "$emailpembeli",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {
                        refs: "$refs",
                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        pembeli: "$pembeli",
                        emailpembeli: "$emailpembeli",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        pembeli: "$pembeli",
                        emailpembeli: "$emailpembeli",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                },
                { $sort: { timestamp: -1 }, },

            ]);


            return query;
        }
    }

    async findhistoryBuyer(iduser: ObjectId, status: string, startdate: string, enddate: string, skip: number, limit: number) {
        var pipeline = new Array<any>(
            {
                $addFields: {
                    type: 'Buy',
                    jenis: "$type",

                },
            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "iduserbuyer",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            }, {
            $lookup: {
                from: "posts",
                localField: "postid",
                foreignField: "postID",
                as: "post_data"
            }
        },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "idusersell",
                    foreignField: "_id",
                    as: "userbasics_sell"
                }
            },
            {
                $project: {
                    iduser: "$iduserbuyer",
                    type: "$type",
                    jenis: "$jenis",
                    timestamp: "$timestamp",
                    description: "$description",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    status: "$status",
                    user: {
                        $arrayElemAt: [
                            "$userbasics_data",
                            0
                        ]
                    },
                    usersell: {
                        $arrayElemAt: [
                            "$userbasics_sell",
                            0
                        ]
                    },
                    postdata: {
                        $arrayElemAt: [
                            "$post_data",
                            0
                        ]
                    },

                }
            }, {
            $project: {
                contentMedias: "$postdata.contentMedias",
                iduser: "$iduser",
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$user.fullName",
                email: "$user.email",
                penjual: "$usersell.fullName",
                emailpenjual: "$usersell.email",
                postID: "$postdata.postID",
                postType: "$postdata.postType",
                descriptionContent: '$postdata.description',
                title: '$postdata.description',

            }
        }, {
            $project: {

                iduser: "$iduser",
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                penjual: "$penjual",
                emailpenjual: "$emailpenjual",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',

            }
        }, {
            $project: {

                iduser: "$iduser",
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                penjual: "$penjual",
                emailpenjual: "$emailpenjual",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',

            }
        }, {
            $project: {

                iduser: "$iduser",
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                penjual: "$penjual",
                emailpenjual: "$emailpenjual",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',

            }
        }, {
            $project: {

                iduser: "$iduser",
                type: "$type",
                jenis: "$jenis",
                timestamp: "$timestamp",
                description: "$description",
                noinvoice: "$noinvoice",
                nova: "$nova",
                expiredtimeva: "$expiredtimeva",
                salelike: "$salelike",
                saleview: "$saleview",
                bank: "$bank",
                amount: "$amount",
                totalamount: "$totalamount",
                status: "$status",
                fullName: "$fullName",
                email: "$email",
                penjual: "$penjual",
                emailpenjual: "$emailpenjual",
                postID: "$postID",
                postType: "$postType",
                descriptionContent: '$descriptionContent',
                title: '$title',

            }
        }
        );
        if (status !== undefined) {
            pipeline.push({
                $match: {
                    status: status
                }
            });
        }
        if (startdate !== undefined) {
            pipeline.push({
                $match: {
                    timestamp: { $gte: startdate }
                }
            });
        }
        if (enddate !== undefined) {
            pipeline.push({
                $match: {
                    timestamp: { $lte: enddate }
                }
            });
        }
        pipeline.push({
            $match: {
                iduserbuyer: iduser
            }
        });
        pipeline.push({ $sort: { timestamp: -1 } });
        if (skip > 0) {
            pipeline.push({
                $skip: skip
            });
        }
        if (limit > 0) {
            pipeline.push({
                $limit: limit
            });
        }
        const query = await this.transactionsModel.aggregate(pipeline);
        return query;

    }
    async findhistoryBuyerCount(iduser: ObjectId, status: string, startdate: string, enddate: string) {

        if (startdate !== undefined && enddate !== undefined && status !== undefined) {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
            const query = await this.transactionsModel.aggregate([
                {
                    $match: {
                        status: status,
                        iduserbuyer: iduser,
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },

                {
                    $addFields: {
                        type: 'Buy',
                        jenis: "$type",

                    },
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "iduserbuyer",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $lookup: {
                        from: "posts",
                        localField: "postid",
                        foreignField: "postID",
                        as: "post_data"
                    }
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "idusersell",
                        foreignField: "_id",
                        as: "userbasics_sell"
                    }
                },
                {
                    $project: {
                        iduser: "$iduserbuyer",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        usersell: {
                            $arrayElemAt: [
                                "$userbasics_sell",
                                0
                            ]
                        },
                        postdata: {
                            $arrayElemAt: [
                                "$post_data",
                                0
                            ]
                        },

                    }
                }, {
                    $project: {
                        contentMedias: "$postdata.contentMedias",
                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        penjual: "$usersell.fullName",
                        emailpenjual: "$usersell.email",
                        postID: "$postdata.postID",
                        postType: "$postdata.postType",
                        descriptionContent: '$postdata.description',
                        title: '$postdata.description',

                    }
                }, {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        penjual: "$penjual",
                        emailpenjual: "$emailpenjual",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        penjual: "$penjual",
                        emailpenjual: "$emailpenjual",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        penjual: "$penjual",
                        emailpenjual: "$emailpenjual",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        penjual: "$penjual",
                        emailpenjual: "$emailpenjual",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                },
                { $sort: { timestamp: -1 }, },

            ]);


            return query;
        }
        else if (startdate !== undefined && enddate !== undefined && status === undefined) {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
            const query = await this.transactionsModel.aggregate([
                {
                    $match: {

                        iduserbuyer: iduser,
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },

                {
                    $addFields: {
                        type: 'Buy',
                        jenis: "$type",

                    },
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "iduserbuyer",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $lookup: {
                        from: "posts",
                        localField: "postid",
                        foreignField: "postID",
                        as: "post_data"
                    }
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "idusersell",
                        foreignField: "_id",
                        as: "userbasics_sell"
                    }
                },
                {
                    $project: {
                        iduser: "$iduserbuyer",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        usersell: {
                            $arrayElemAt: [
                                "$userbasics_sell",
                                0
                            ]
                        },
                        postdata: {
                            $arrayElemAt: [
                                "$post_data",
                                0
                            ]
                        },

                    }
                }, {
                    $project: {
                        contentMedias: "$postdata.contentMedias",
                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        penjual: "$usersell.fullName",
                        emailpenjual: "$usersell.email",
                        postID: "$postdata.postID",
                        postType: "$postdata.postType",
                        descriptionContent: '$postdata.description',
                        title: '$postdata.description',

                    }
                }, {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        penjual: "$penjual",
                        emailpenjual: "$emailpenjual",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        penjual: "$penjual",
                        emailpenjual: "$emailpenjual",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        penjual: "$penjual",
                        emailpenjual: "$emailpenjual",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        penjual: "$penjual",
                        emailpenjual: "$emailpenjual",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                },
                { $sort: { timestamp: -1 }, },

            ]);


            return query;
        }
        else if (startdate === undefined && enddate === undefined && status !== undefined) {

            const query = await this.transactionsModel.aggregate([
                {
                    $match: {
                        status: status,
                        iduserbuyer: iduser,

                    }
                },

                {
                    $addFields: {
                        type: 'Buy',
                        jenis: "$type",

                    },
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "iduserbuyer",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $lookup: {
                        from: "posts",
                        localField: "postid",
                        foreignField: "postID",
                        as: "post_data"
                    }
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "idusersell",
                        foreignField: "_id",
                        as: "userbasics_sell"
                    }
                },
                {
                    $project: {
                        iduser: "$iduserbuyer",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        usersell: {
                            $arrayElemAt: [
                                "$userbasics_sell",
                                0
                            ]
                        },
                        postdata: {
                            $arrayElemAt: [
                                "$post_data",
                                0
                            ]
                        },

                    }
                }, {
                    $project: {
                        contentMedias: "$postdata.contentMedias",
                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        penjual: "$usersell.fullName",
                        emailpenjual: "$usersell.email",
                        postID: "$postdata.postID",
                        postType: "$postdata.postType",
                        descriptionContent: '$postdata.description',
                        title: '$postdata.description',

                    }
                }, {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        penjual: "$penjual",
                        emailpenjual: "$emailpenjual",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        penjual: "$penjual",
                        emailpenjual: "$emailpenjual",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        penjual: "$penjual",
                        emailpenjual: "$emailpenjual",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        penjual: "$penjual",
                        emailpenjual: "$emailpenjual",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                },
                { $sort: { timestamp: -1 }, },

            ]);


            return query;
        }
        else {
            const query = await this.transactionsModel.aggregate([
                {
                    $match: {

                        iduserbuyer: iduser
                    }
                },

                {
                    $addFields: {
                        type: 'Buy',
                        jenis: "$type",

                    },
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "iduserbuyer",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $lookup: {
                        from: "posts",
                        localField: "postid",
                        foreignField: "postID",
                        as: "post_data"
                    }
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "idusersell",
                        foreignField: "_id",
                        as: "userbasics_sell"
                    }
                },
                {
                    $project: {
                        iduser: "$iduserbuyer",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        usersell: {
                            $arrayElemAt: [
                                "$userbasics_sell",
                                0
                            ]
                        },
                        postdata: {
                            $arrayElemAt: [
                                "$post_data",
                                0
                            ]
                        },

                    }
                }, {
                    $project: {
                        contentMedias: "$postdata.contentMedias",
                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        penjual: "$usersell.fullName",
                        emailpenjual: "$usersell.email",
                        postID: "$postdata.postID",
                        postType: "$postdata.postType",
                        descriptionContent: '$postdata.description',
                        title: '$postdata.description',

                    }
                }, {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        penjual: "$penjual",
                        emailpenjual: "$emailpenjual",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        penjual: "$penjual",
                        emailpenjual: "$emailpenjual",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        penjual: "$penjual",
                        emailpenjual: "$emailpenjual",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                }, {
                    $project: {

                        iduser: "$iduser",
                        type: "$type",
                        jenis: "$jenis",
                        timestamp: "$timestamp",
                        description: "$description",
                        noinvoice: "$noinvoice",
                        nova: "$nova",
                        expiredtimeva: "$expiredtimeva",
                        salelike: "$salelike",
                        saleview: "$saleview",
                        bank: "$bank",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        fullName: "$fullName",
                        email: "$email",
                        penjual: "$penjual",
                        emailpenjual: "$emailpenjual",
                        postID: "$postID",
                        postType: "$postType",
                        descriptionContent: '$descriptionContent',
                        title: '$title',

                    }
                },
                { $sort: { timestamp: -1 }, },

            ]);

            return query;
        }

    }
}
