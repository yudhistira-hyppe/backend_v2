import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
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
        @InjectModel(Transactions.name, 'SERVER_TRANS')
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
        return this.transactionsModel.findOne({ postid: postid, status: "success" }).exec();
    }

    async findpostidpending(postid: string): Promise<Transactions> {
        return this.transactionsModel.findOne({ postid: postid, status: "WAITING_PAYMENT" }).exec();
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

    async updatestatuscancel(id: Types.ObjectId): Promise<Object> {
        let data = await this.transactionsModel.updateOne({ "_id": id },
            { $set: { "status": "Cancel", "description": "VA expired time" } });
        return data;
    }

    async findhistoryBuy(iduser: ObjectId, status: string, startdate: string, enddate: string, skip: number, limit: number) {
        const posts = await this.postsService.findpost();
        const video = await this.mediavideosService.findvideo();
        const pict = await this.mediapictsService.findpict();
        const diaries = await this.mediadiariesService.finddiaries();

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
                        from: "posts2",
                        localField: "postid",
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
                                default: ""
                            }
                        },
                    }
                },
                { $sort: { timestamp: 1 }, },
                {
                    $skip: skip
                }, {
                    $limit: limit
                }
            ]);

            var data = null;
            var arrdata = [];
            let pict: String[] = [];
            var objk = {};
            for (var i = 0; i < query.length; i++) {
                var idapsara = query[i].apsaraId;
                pict.push(idapsara);
                data = await this.postContentService.getImageApsara(pict);
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
                    "postID": query[i].postID,
                    "postType": query[i].postType,
                    "descriptionContent": query[i].descriptionContent,
                    "title": query[i].title,
                    "mediaType": query[i].mediaType,
                    "mediaEndpoint": query[i].mediaEndpoint,
                    "apsaraId": query[i].apsaraId,
                    "apsara": query[i].apsara,
                    "media": data
                };

                arrdata.push(objk);
            }
            return arrdata;
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
                        from: "posts2",
                        localField: "postid",
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
                                default: ""
                            }
                        },

                    }
                },
                { $sort: { timestamp: 1 }, },
                {
                    $skip: skip
                }, {
                    $limit: limit
                }
            ]);
            var data = null;
            var arrdata = [];
            let pict: String[] = [];
            var objk = {};
            for (var i = 0; i < query.length; i++) {
                var idapsara = query[i].apsaraId;
                pict.push(idapsara);
                data = await this.postContentService.getImageApsara(pict);
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
                    "postID": query[i].postID,
                    "postType": query[i].postType,
                    "descriptionContent": query[i].descriptionContent,
                    "title": query[i].title,
                    "mediaType": query[i].mediaType,
                    "mediaEndpoint": query[i].mediaEndpoint,
                    "apsaraId": query[i].apsaraId,
                    "apsara": query[i].apsara,
                    "media": data
                };

                arrdata.push(objk);
            }
            return arrdata;
        }
        else if (startdate === undefined && enddate === undefined && status !== undefined) {
            // var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            // var dateend = currentdate.toISOString();
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
                        from: "posts2",
                        localField: "postid",
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
                                default: ""
                            }
                        },

                    }
                },
                { $sort: { timestamp: 1 }, },
                {
                    $skip: skip
                }, {
                    $limit: limit
                }
            ]);
            var data = null;
            var arrdata = [];
            let pict: String[] = [];
            var objk = {};
            for (var i = 0; i < query.length; i++) {
                var idapsara = query[i].apsaraId;
                pict.push(idapsara);
                data = await this.postContentService.getImageApsara(pict);
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
                    "postID": query[i].postID,
                    "postType": query[i].postType,
                    "descriptionContent": query[i].descriptionContent,
                    "title": query[i].title,
                    "mediaType": query[i].mediaType,
                    "mediaEndpoint": query[i].mediaEndpoint,
                    "apsaraId": query[i].apsaraId,
                    "apsara": query[i].apsara,
                    "media": data
                };

                arrdata.push(objk);
            }
            return arrdata;
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
                        from: "posts2",
                        localField: "postid",
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
                                default: ""
                            }
                        },
                    }
                },
                { $sort: { timestamp: 1 }, },
                {
                    $skip: skip
                }, {
                    $limit: limit
                }
            ]);
            var data = null;
            var arrdata = [];
            let pict: String[] = [];
            var objk = {};
            for (var i = 0; i < query.length; i++) {
                var idapsara = query[i].apsaraId;
                pict.push(idapsara);
                data = await this.postContentService.getImageApsara(pict);
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
                    "postID": query[i].postID,
                    "postType": query[i].postType,
                    "descriptionContent": query[i].descriptionContent,
                    "title": query[i].title,
                    "mediaType": query[i].mediaType,
                    "mediaEndpoint": query[i].mediaEndpoint,
                    "apsaraId": query[i].apsaraId,
                    "apsara": query[i].apsara,
                    "media": data
                };

                arrdata.push(objk);
            }
            return arrdata;
        }

    }

    async findhistoryBuyCount(iduser: ObjectId, status: string, startdate: string, enddate: string, skip: number, limit: number) {
        const posts = await this.postsService.findpost();
        const video = await this.mediavideosService.findvideo();
        const pict = await this.mediapictsService.findpict();
        const diaries = await this.mediadiariesService.finddiaries();

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
                        from: "posts2",
                        localField: "postid",
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
                    }
                },
                { $sort: { timestamp: 1 }, },

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
                        from: "posts2",
                        localField: "postid",
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
                    }
                },
                { $sort: { timestamp: 1 }, },

            ]);
            return query;
        }
        else if (startdate === undefined && enddate === undefined && status !== undefined) {
            // var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            // var dateend = currentdate.toISOString();
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
                        from: "posts2",
                        localField: "postid",
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
                    }
                },
                { $sort: { timestamp: 1 }, },

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
                        from: "posts2",
                        localField: "postid",
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
                    }
                },
                { $sort: { timestamp: 1 }, },

            ]);
            return query;
        }

    }

    async findhistorySell(iduser: ObjectId, status: string, startdate: string, enddate: string, skip: number, limit: number) {
        const posts = await this.postsService.findpost();
        const video = await this.mediavideosService.findvideo();
        const pict = await this.mediapictsService.findpict();
        const diaries = await this.mediadiariesService.finddiaries();


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
                        from: "posts2",
                        localField: "postid",
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
                                default: ""
                            }
                        },
                    }
                },
                { $sort: { timestamp: 1 }, },
                {
                    $skip: skip
                }, {
                    $limit: limit
                }
            ]);
            var data = null;
            var arrdata = [];
            let pict: String[] = [];
            var objk = {};
            for (var i = 0; i < query.length; i++) {
                var idapsara = query[i].apsaraId;
                pict.push(idapsara);
                data = await this.postContentService.getImageApsara(pict);
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
                    "postID": query[i].postID,
                    "postType": query[i].postType,
                    "descriptionContent": query[i].descriptionContent,
                    "title": query[i].title,
                    "mediaType": query[i].mediaType,
                    "mediaEndpoint": query[i].mediaEndpoint,
                    "apsaraId": query[i].apsaraId,
                    "apsara": query[i].apsara,
                    "media": data
                };

                arrdata.push(objk);
            }
            return arrdata;
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
                        from: "posts2",
                        localField: "postid",
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
                                default: ""
                            }
                        },
                    }
                },
                { $sort: { timestamp: 1 }, },
                {
                    $skip: skip
                }, {
                    $limit: limit
                }
            ]);
            var data = null;
            var arrdata = [];
            let pict: String[] = [];
            var objk = {};
            for (var i = 0; i < query.length; i++) {
                var idapsara = query[i].apsaraId;
                pict.push(idapsara);
                data = await this.postContentService.getImageApsara(pict);
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
                    "postID": query[i].postID,
                    "postType": query[i].postType,
                    "descriptionContent": query[i].descriptionContent,
                    "title": query[i].title,
                    "mediaType": query[i].mediaType,
                    "mediaEndpoint": query[i].mediaEndpoint,
                    "apsaraId": query[i].apsaraId,
                    "apsara": query[i].apsara,
                    "media": data
                };

                arrdata.push(objk);
            }
            return arrdata;

        }
        else if (startdate === undefined && enddate === undefined && status !== undefined) {
            // var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            // var dateend = currentdate.toISOString();
            const query = await this.transactionsModel.aggregate([
                {
                    $match: {
                        status: status,
                        idusersell: iduser,
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
                        from: "posts2",
                        localField: "postid",
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
                                default: ""
                            }
                        },
                    }
                },
                { $sort: { timestamp: 1 }, },
                {
                    $skip: skip
                }, {
                    $limit: limit
                }
            ]);


            var data = null;
            var arrdata = [];
            let pict: String[] = [];
            var objk = {};
            var type = null;
            for (var i = 0; i < query.length; i++) {
                var idapsara = query[i].apsaraId;
                var type = query[i].postType;
                pict.push(idapsara);
                if (type === "pict") {
                    data = await this.postContentService.getImageApsara(pict);
                }
                else if (type === "vid") {
                    data = await this.postContentService.getVideoApsara(pict);
                }
                else if (type === "story") {
                    data = await this.postContentService.getVideoApsara(pict);
                }
                else if (type === "diary") {
                    data = await this.postContentService.getVideoApsara(pict);
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
                    "postID": query[i].postID,
                    "postType": query[i].postType,
                    "descriptionContent": query[i].descriptionContent,
                    "title": query[i].title,
                    "mediaType": query[i].mediaType,
                    "mediaEndpoint": query[i].mediaEndpoint,
                    "apsaraId": query[i].apsaraId,
                    "apsara": query[i].apsara,
                    "media": data
                };

                arrdata.push(objk);
            }
            return arrdata;
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
                        from: "posts2",
                        localField: "postid",
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
                                default: ""
                            }
                        },
                    }
                },
                { $sort: { timestamp: 1 }, },
                {
                    $skip: skip
                }, {
                    $limit: limit
                }
            ]);

            var data = null;
            var arrdata = [];
            let pict: String[] = [];
            var objk = {};
            for (var i = 0; i < query.length; i++) {
                var idapsara = query[i].apsaraId;
                pict.push(idapsara);
                data = await this.postContentService.getImageApsara(pict);
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
                    "postID": query[i].postID,
                    "postType": query[i].postType,
                    "descriptionContent": query[i].descriptionContent,
                    "title": query[i].title,
                    "mediaType": query[i].mediaType,
                    "mediaEndpoint": query[i].mediaEndpoint,
                    "apsaraId": query[i].apsaraId,
                    "apsara": query[i].apsara,
                    "media": data
                };

                arrdata.push(objk);
            }
            return arrdata;
        }
    }
    async findhistorySellCount(iduser: ObjectId, status: string, startdate: string, enddate: string, skip: number, limit: number) {
        const posts = await this.postsService.findpost();
        const video = await this.mediavideosService.findvideo();
        const pict = await this.mediapictsService.findpict();
        const diaries = await this.mediadiariesService.finddiaries();

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
                        from: "posts2",
                        localField: "postid",
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
                    }
                },
                { $sort: { timestamp: 1 }, },

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
                        from: "posts2",
                        localField: "postid",
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
                    }
                },
                { $sort: { timestamp: 1 }, },

            ]);
            return query;
        }
        else if (startdate === undefined && enddate === undefined && status !== undefined) {
            // var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            // var dateend = currentdate.toISOString();
            const query = await this.transactionsModel.aggregate([
                {
                    $match: {
                        status: status,
                        idusersell: iduser,
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
                        from: "posts2",
                        localField: "postid",
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
                    }
                },
                { $sort: { timestamp: 1 }, },

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
                        from: "posts2",
                        localField: "postid",
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
                    }
                },
                { $sort: { timestamp: 1 }, },

            ]);
            return query;
        }
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
                    from: "posts2",
                    localField: "postid",
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
                    from: "posts2",
                    localField: "postid",
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

}
