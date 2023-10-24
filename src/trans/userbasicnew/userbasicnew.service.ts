import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Userbasicnew, UserbasicnewDocument } from './schemas/userbasicnew.schema';

@Injectable()
export class UserbasicnewService {
    constructor(
        @InjectModel(Userbasicnew.name, 'SERVER_FULL')
        private readonly UserbasicnewModel: Model<UserbasicnewDocument>,
    ) { }

    async create(Userbasicnew_: Userbasicnew): Promise<Userbasicnew> {
        const _Userbasicnew_ = await this.UserbasicnewModel.create(Userbasicnew_);
        return _Userbasicnew_;
    }
    async findOne(id: string): Promise<Userbasicnew> {
        return this.UserbasicnewModel.findOne({ _id: new Types.ObjectId(id) }).exec();
    }
    async find(): Promise<Userbasicnew[]> {
        return this.UserbasicnewModel.find().exec();
    }

    async findbyemail(email: string): Promise<Userbasicnew> {
        return this.UserbasicnewModel.findOne({ email: email }).exec();
    }

    async findbyusername(username: string): Promise<Userbasicnew> {
        return this.UserbasicnewModel.findOne({ username: username }).exec();
    }

    async findbyidauth(id: string): Promise<Userbasicnew> {
        var mongo = require('mongoose');
        return this.UserbasicnewModel.findOne({ _idAuth: new mongo.Types.ObjectId(id) }).exec();
    }

    async finddetail(email: string) {
        var result = await this.UserbasicnewModel.aggregate([
            {
                "$match":
                {
                    email: email
                }
            },
            {
                "$addFields":
                {
                    "urluserBadge":
                    {
                        "$ifNull":
                            [
                                {
                                    "$filter":
                                    {
                                        input: "$userBadge",
                                        as: "listbadge",
                                        cond:
                                        {
                                            "$and":
                                                [
                                                    {
                                                        "$eq":
                                                            [
                                                                "$$listbadge.isActive", true
                                                            ]
                                                    },
                                                    {
                                                        "$lte": [
                                                            {
                                                                "$dateToString": {
                                                                    "format": "%Y-%m-%d %H:%M:%S",
                                                                    "date": {
                                                                        "$add": [
                                                                            new Date(),
                                                                            25200000
                                                                        ]
                                                                    }
                                                                }
                                                            },
                                                            "$$listbadge.endDatetime"
                                                        ]
                                                    }
                                                ]
                                        }
                                    },
                                },
                                []
                            ]
                    },
                }
            },
            {
                "$project":
                {
                    "_id": 1,
                    "profileID": 1,
                    "email": 1,
                    "fullName": 1,
                    "dob": 1,
                    "gender":
                    {
                        "$ifNull":
                            [
                                "$gender",
                                "Other"
                            ]
                    },
                    "status": 1,
                    "event": 1,
                    "isComplete": 1,
                    "isCelebrity": 1,
                    "isIdVerified": 1,
                    "isPrivate": 1,
                    "isFollowPrivate": 1,
                    "isPostPrivate": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "insight": 1,
                    "userInterests": 1,
                    "languages": 1,
                    "_class": 1,
                    "statusKyc": 1,
                    "reportedUser": 1,
                    "reportedUserHandle": 1,
                    "listAddKyc": 1,
                    "userAssets": 1,
                    "__v": 1,
                    "profilePict": 1,
                    "bio": 1,
                    "mobileNumber": 1,
                    "timeEmailSend": 1,
                    "icon": 1,
                    "userBadge": 1,
                    "countries": 1,
                    "states": 1,
                    "cities": 1,
                    "idProofNumber": 1,
                    "idProofStatus": 1,
                    "pin": 1,
                    "otppinVerified": 1,
                    "tutor": 1,
                    urluserBadge:
                    {
                        "$ifNull": [
                            {
                                "$arrayElemAt":
                                    [
                                        "$urluserBadge", 0
                                    ]
                            },
                            null
                        ]
                    },
                    "username": 1,
                    "languagesLangIso": 1,
                    "countriesName": 1,
                    "citiesName": 1,
                    "statesName": 1,
                    "mediaBasePath": 1,
                    "mediaUri": 1,
                    "mediaType": 1,
                    "mediaEndpoint": 1,
                    "oneTimePassword": 1,
                    "otpToken": 1,
                    "isEmailVerified": 1,
                    "authUsers": 1,
                    "roles": 1,
                    "otpNextAttemptAllow": 1,
                    "follower": 1,
                    "following": 1,
                    "userEvent": 1,
                    "languagesLang": 1,
                    "password": 1,
                    "userID": 1,
                    "isExpiryPass": 1,
                    "otpRequestTime": 1,
                    "otpAttempt": 1,
                    "location": 1,
                    "isEnabled": 1,
                    "isAccountNonExpired": 1,
                    "isAccountNonLocked": 1,
                    "isCredentialsNonExpired": 1,
                    "_idAvatar": 1,
                    "originalName": 1,
                    "fsSourceUri": 1,
                    "fsSourceName": 1,
                    "fsTargetUri": 1,
                    "kyc": 1
                }
            }
        ]);

        return result[0];
    }

    async detailDenganlookupLain(target: string, tipe: string) {
        var pipeline = [];
        if (tipe == 'id') {
            var mongo = require('mongoose');
            pipeline.push(
                {
                    "$match":
                    {
                        _id: new mongo.Types.ObjectId(target)
                    }
                }
            );
        }
        else {
            pipeline.push(
                {
                    "$match":
                    {
                        email: target
                    }
                }
            );
        }

        pipeline.push({
            $lookup:
            {
                from: 'insights',
                localField: 'insight.$id',
                foreignField: '_id',
                as: 'insight_data',
            },
        },
            {
                $lookup:
                {
                    from: 'insights',
                    let:
                    {
                        "id": "$insight.$id"
                    },
                    as: "insight_data",
                    pipeline:
                        [
                            {
                                "$match":
                                {

                                }
                            }
                        ]
                }
            },
            {
                $lookup:
                {
                    from: 'friend_list',
                    localField: 'email',
                    foreignField: 'email',
                    as: 'friend_data',
                },
            },
            {
                $lookup:
                {
                    from: 'userbankaccounts',
                    let:
                    {
                        "id": "$_id"
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $eq: ["$userId", "$$id"]
                                }
                            }
                        },
                        {
                            $lookup:
                            {
                                from: "banks",
                                localField: "idBank",
                                foreignField: "_id",
                                as: "bankName",
                            }
                        },
                        {
                            "$project":
                            {
                                userId: 1,
                                noRek: 1,
                                nama: 1,
                                statusInquiry: 1,
                                active: 1,
                                bankId:
                                {
                                    "$arrayElemAt":
                                        [
                                            "$bankName._id", 0
                                        ]
                                },
                                bankcode:
                                {
                                    "$arrayElemAt":
                                        [
                                            "$bankName.bankcode", 0
                                        ]
                                },
                                bankname:
                                {
                                    "$arrayElemAt":
                                        [
                                            "$bankName.bankname", 0
                                        ]
                                },
                                urlEbanking:
                                {
                                    "$arrayElemAt":
                                        [
                                            "$bankName.urlEbanking", 0
                                        ]
                                },
                                bankIcon:
                                {
                                    "$arrayElemAt":
                                        [
                                            "$bankName.bankIcon", 0
                                        ]
                                },
                            }
                        }
                    ],
                    as: 'userbankaccounts_data'
                }
            },
            {
                "$facet":
                {
                    "detail":
                        [
                            {
                                "$project":
                                {
                                    _id: 1,
                                    email: 1,
                                    areas: "$statesName",
                                    country: "$countriesName",
                                    city: "$citiesName",
                                    gender: 1,
                                    createdAt: 1,
                                    idProofNumber: 1,
                                    mobileNumber: 1,
                                    roles: 1,
                                    fullName: 1,
                                    bio: 1,
                                    avatar:
                                    {
                                        mediaBasePath:
                                        {
                                            "$ifNull":
                                                [
                                                    "$mediaBasePath",
                                                    null
                                                ]
                                        },
                                        mediaUri:
                                        {
                                            "$ifNull":
                                                [
                                                    "$mediaUri",
                                                    null
                                                ]
                                        },
                                        mediaType:
                                        {
                                            "$ifNull":
                                                [
                                                    "$mediaType",
                                                    null
                                                ]
                                        },
                                        mediaEndpoint:
                                        {
                                            "$ifNull":
                                                [
                                                    "$mediaEndpoint",
                                                    null
                                                ]
                                        },
                                    },
                                    isIdVerified: 1,
                                    isEmailVerified: 1,
                                    idProofStatus: 1,
                                    insight:
                                    {
                                        shares:
                                        {
                                            "$arrayElemAt":
                                                [
                                                    "$insight_data.shares", 0
                                                ]
                                        },
                                        followers:
                                        {
                                            "$arrayElemAt":
                                                [
                                                    "$insight_data.followers", 0
                                                ]
                                        },
                                        comments:
                                        {
                                            "$arrayElemAt":
                                                [
                                                    "$insight_data.comments", 0
                                                ]
                                        },
                                        followings:
                                        {
                                            "$arrayElemAt":
                                                [
                                                    "$insight_data.followings", 0
                                                ]
                                        },
                                        reactions:
                                        {
                                            "$arrayElemAt":
                                                [
                                                    "$insight_data.reactions", 0
                                                ]
                                        },
                                        posts:
                                        {
                                            "$arrayElemAt":
                                                [
                                                    "$insight_data.posts", 0
                                                ]
                                        },
                                        views:
                                        {
                                            "$arrayElemAt":
                                                [
                                                    "$insight_data.views", 0
                                                ]
                                        },
                                        likes:
                                        {
                                            "$arrayElemAt":
                                                [
                                                    "$insight_data.likes", 0
                                                ]
                                        },
                                        friend:
                                        {
                                            "$arrayElemAt":
                                                [
                                                    "$friend_data.totalfriend", 0
                                                ]
                                        }
                                    },
                                    langIso: "$languagesLangIso",
                                    interest: "$interests_repo_data",
                                    dob: 1,
                                    event: 1,
                                    username: 1,
                                    isComplete: 1,
                                    status: 1,
                                    statusUser:
                                    {
                                        "$cond":
                                        {
                                            if:
                                            {
                                                "$eq": ["$isIdVerified", true]
                                            },
                                            then: "PREMIUM",
                                            else: "BASIC"
                                        }
                                    },
                                    loginSource:
                                    {
                                        "$cond":
                                        {
                                            if:
                                            {
                                                "$eq":
                                                    [
                                                        "$password", "$2a$10$GTQLm6mRlZVoBhR8LSm8T.CDI3TG6CViPdiTAt2tfRY3dNwOk7s1G"
                                                    ]
                                            },
                                            then: "socmed",
                                            else: "manual"

                                        }
                                    },
                                    databank: "$userbankaccounts_data",
                                    mediaId: "$proofPict.$id"
                                }
                            }
                        ],
                    "interests":
                        [
                            {
                                "$lookup":
                                {
                                    from: 'interests',
                                    localField: 'userInterests.$id',
                                    foreignField: '_id',
                                    as: 'interest_data',
                                },
                            },
                            {
                                "$unwind":
                                {
                                    path: "$interest_data",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                "$project":
                                {
                                    _id: 0,
                                    interestName: "$interest_data.interestName",
                                    icon: "$interest_data.icon",
                                    createdAt: "$interest_data.createdAt",
                                    updatedAt: "$interest_data.updatedAt",
                                    _class: "$interest_data._class",
                                }
                            }
                        ],
                    "dokumen":
                        [
                            {
                                "$unwind":
                                {
                                    path: "$kyc",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                "$project":
                                {
                                    valid: "$kyc.valid",
                                    idcardnumber: "$kyc.idcardnumber",
                                    postType: "$kyc.postType",
                                    proofpictUploadSource: "$kyc.proofpictUploadSource",
                                    nama: "$kyc.nama",
                                    tempatLahir: "$kyc.tempatLahir",
                                    jenisKelamin: "$kyc.jenisKelamin",
                                    alamat: "$kyc.alamat",
                                    agama: "$kyc.agama",
                                    statusPerkawinan: "$kyc.statusPerkawinan",
                                    pekerjaan: "$kyc.pekerjaan",
                                    kewarganegaraan: "$kyc.kewarganegaraan",
                                    dokumen:
                                        [
                                            {
                                                mediaproofpicts:
                                                {
                                                    mediaId: "$proofPict.$id",
                                                    mediaBasePath: "$kyc.mediaBasePath",
                                                    mediaUri: "$kyc.mediaUri",
                                                    postType: "$kyc.mediaType",
                                                    mediaEndpoint:
                                                    {
                                                        "$concat":
                                                            [
                                                                "proofpict",
                                                                "/",
                                                                "$proofPict.$id"
                                                            ]
                                                    }
                                                },
                                                mediaSelfiepicts:
                                                {
                                                    mediaId: "$proofPict.$id",
                                                    mediaBasePath: "$kyc.mediaSelfieBasePath",
                                                    mediaUri: "$kyc.mediaSelfieUri",
                                                    postType: "$kyc.mediaSelfieType",
                                                    mediaEndpoint:
                                                    {
                                                        "$concat":
                                                            [
                                                                "proofpict",
                                                                "/",
                                                                "$proofPict.$id"
                                                            ]
                                                    }
                                                },
                                                mediaSupportfile:
                                                {
                                                    mediaEndpoint:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $or: [{
                                                                    $eq: ['$kyc.SupportfsSourceUri', null]
                                                                }, {
                                                                    $eq: ['$kyc.SupportfsSourceUri', ""]
                                                                }, {
                                                                    $eq: ['$kyc.SupportfsSourceUri', []]
                                                                }, {
                                                                    $eq: ['$kyc.SupportfsSourceUri', {}]
                                                                }]
                                                            },
                                                            then: [],
                                                            else: '$kyc.SupportfsSourceUri'
                                                        },
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
                    _id:
                    {
                        "$arrayElemAt":
                            [
                                "$detail._id", 0
                            ]
                    },
                    email:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.email", 0
                            ]
                    },
                    fullName:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.fullName", 0
                            ]
                    },
                    dob:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.dob", 0
                            ]
                    },
                    mobileNumber:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.mobileNumber", 0
                            ]
                    },
                    status:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.status", 0
                            ]
                    },
                    event:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.event", 0
                            ]
                    },
                    idProofNumber:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.idProofNumber", 0
                            ]
                    },
                    idProofStatus:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.idProofStatus", 0
                            ]
                    },
                    isComplete:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.isComplete", 0
                            ]
                    },
                    isIdVerified:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.isIdVerified", 0
                            ]
                    },
                    createdAt:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.createdAt", 0
                            ]
                    },
                    bio:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.bio", 0
                            ]
                    },
                    insight:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.insight", 0
                            ]
                    },
                    gender:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.gender", 0
                            ]
                    },
                    username:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.username", 0
                            ]
                    },
                    isEmailVerified:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.isEmailVerified", 0
                            ]
                    },
                    roles:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.roles", 0
                            ]
                    },
                    areas:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.areas", 0
                            ]
                    },
                    country:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.country", 0
                            ]
                    },
                    city:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.city", 0
                            ]
                    },
                    avatar:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.avatar", 0
                            ]
                    },
                    langIso:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.langIso", 0
                            ]
                    },
                    statusUser:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.statusUser", 0
                            ]
                    },
                    databank:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.databank", 0
                            ]
                    },
                    mediaId:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.mediaId", 0
                            ]
                    },
                    loginSource:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.loginSource", 0
                            ]
                    },
                    interest:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$and":
                                    [
                                        {
                                            "$eq":
                                                [
                                                    {
                                                        "$size": "$interests"
                                                    },
                                                    0
                                                ]
                                        },
                                        {
                                            "$eq":
                                                [
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$detail._id", 0
                                                            ]
                                                    },
                                                    null
                                                ]
                                        }
                                    ]
                            },
                            then: "$$REMOVE",
                            else: "$interests"
                        }
                    },
                    dokumen:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$and":
                                    [
                                        {
                                            "$eq":
                                                [
                                                    {
                                                        "$size": "$dokumen"
                                                    },
                                                    0
                                                ]
                                        },
                                        {
                                            "$eq":
                                                [
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$detail._id", 0
                                                            ]
                                                    },
                                                    null
                                                ]
                                        }
                                    ]
                            },
                            then: "$$REMOVE",
                            else:
                            {
                                "$arrayElemAt":
                                    [
                                        "$dokumen", 0
                                    ]
                            }
                        }
                    },
                }
            }
        );

        // console.log(JSON.stringify(pipeline));

        var data = await this.UserbasicnewModel.aggregate(pipeline);

        return data;
    }

    async update(id: string, Userbasicnew_: Userbasicnew): Promise<Userbasicnew> {
        let data = await this.UserbasicnewModel.findByIdAndUpdate(id, Userbasicnew_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }

    async updatebyemail(email: string, Userbasicnew_: Userbasicnew) {
        let data = await this.UserbasicnewModel.updateOne(
            {
                email: email
            },
            Userbasicnew_,
            { new: true }
        );

        if (!data) {
            throw new Error('Data is not found!');
        }

        return data;
    }

    async updatebyEmailAuth(email: String, data: Object) {
        this.UserbasicnewModel.updateOne(
            {
                email: email,
            },
            data,
            function (err, docs) {
                if (err) {
                    //console.log(err);
                } else {
                    //console.log(docs);
                }
            },
        );
    }
    async updateStatusemail(email: string, timeEmailSend: string): Promise<Object> {
        let data = await this.UserbasicnewModel.updateOne({ "email": email },
            {
                $set: {
                    timeEmailSend: timeEmailSend
                }
            },
        );
        return data;
    }

    async findOneupdatebyEmail(email: String) {
        this.UserbasicnewModel.updateOne(
            {
                email: email,
            },
            { $inc: { otpAttempt: 1 } },
            function (err, docs) {
                if (err) {
                    //console.log(err);
                } else {
                    //console.log(docs);
                }
            },
        );
    }

    async delete(id: string) {
        const data = await this.UserbasicnewModel.findByIdAndRemove({ _id: new Types.ObjectId(id) }).exec();
        return data;
    }

    async updateLanguage(email: string, CreateUserbasicnewDto_: Userbasicnew) {
        console.log(CreateUserbasicnewDto_);
        this.UserbasicnewModel.updateOne(
            {
                email: email,
            },
            {
                $set: CreateUserbasicnewDto_
            },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        ).clone().exec();
    }

    async getUserActiveByDate(startdate: string) {
        var convertstart = startdate.split(" ")[0];
        var date = new Date();
        var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var convertend = DateTime.substring(0, DateTime.lastIndexOf('.')).split(" ")[0];

        //kalo error, coba ganti jadi set dan jadi object
        var query = await this.UserbasicnewModel.aggregate([
          {
            "$match":
            {
              createdAt:
              {
                "$gte": convertstart,
                "$lte": convertend
              },
              isEnabled: true
            }
          },
          {
            "$project":
            {
              createdAt:
              {
                "$substr":
                  [
                    "$createdAt", 0, 10
                  ]
              }
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
                "$sum": 1
              }
            }
          },
          {
            "$project":
            {
              _id: 1,
              totalperhari: 1
            }
          },
          {
            "$unwind":
            {
              path: "$_id"
            }
          },
          {
            "$sort":
            {
              _id: 1
            }
          },
          {
            "$group":
            {
              _id: null,
              total:
              {
                "$sum": "$totalperhari"
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
                          "$toString": "$_id"
                        }, 0, 10
                      ]
                  },
                  totaldata: "$totalperhari"
                }
              }
            }
          }
        ]);
    
        return query;
    }

    async regexfindUser(target:string, page:number, limit:number)
    {
        var query = await this.UserbasicnewModel.aggregate([
            {
                "$match":
                {
                    "username":
                    {
                        "$regex":target,
                        "$options":"i"
                    }
                }
            },
            {
                "$project":
                {
                    idUserAuth:"$_id",
                    email:1,
                    profilpictId:"$profilePict.$id",
                    fullName:1,
                    username:1,
                    avatar:
                    {
                        mediaBasePath:"$mediaBasePath",
                        mediaUri:"$mediaUri",
                        mediaType:"$mediaType",
                        mediaEndpoint:"$mediaEndpoint"
                    }
                }
            },
            {
                "$sort":
                {
                    fullName:1
                }                
            },
            {
                "$skip":page * limit
            },
            {
                "$limit":limit
            }
        ]);

        return query;
    }

    async getUserHyppe3(search: string, startdate:string, enddate:string, jabatan:any[], divisi:any[], status:boolean, skip: number, limit: number, ascending:boolean) {
        var pipeline = [];
        pipeline.push(
            { '$match': { email: /@hyppe.id/i } },
            {
            '$lookup': {
                from: 'group',
                let: { userName: '$_id' },
                pipeline: [
                {
                    '$match': { '$expr': { '$in': [ '$$userName', '$userbasics' ] } }
                }
                ],
                as: 'group_userbasics'
            }
            },
            {
            '$project': {
                idUserAuth:"$id",
                group_userbasics: {
                '$ifNull': [ { '$arrayElemAt': [ '$group_userbasics', 0 ] }, null ]
                },
                fullName: '$fullName',
                username: '$username',
                email: '$email',
                isIdVerified: '$isIdVerified',
                createdAt:"$createdAt",
                roles: { '$ifNull': [ '$roles', [] ] },
                avatar: {
                mediaBasePath: { '$ifNull': [ '$mediaBasePath', null ] },
                mediaUri: { '$ifNull': [ '$mediaUri', null ] },
                mediaType: { '$ifNull': [ '$mediaType', null ] },
                mediaEndpoint: { '$ifNull': [ '$mediaEndpoint', null ] }
                }
            }
            },
            {
            '$lookup': {
                from: 'division',
                localField: 'group_userbasics.divisionId',
                foreignField: '_id',
                as: 'division_data'
            }
            },
            {
            '$project': {
                idUserAuth:"$idUserAuth",
                group_userbasics: '$group_userbasics',
                fullName: '$fullName',
                username: '$username',
                email: '$email',
                isIdVerified: { '$in': [ 'ROLE_ADMIN', '$roles' ] },
                avatar: '$avatar',
                createdAt:"$createdAt",
            }
            },
            {
            '$lookup': {
                from: 'division',
                localField: 'group_userbasics.divisionId',
                foreignField: '_id',
                as: 'division_data'
            }
            },
            {
            '$project': {
                namadivisi: { '$arrayElemAt': [ '$division_data.nameDivision', 0 ] },
                group: '$group_userbasics.nameGroup',
                groupId: '$group_userbasics._id',
                fullName: '$fullName',
                username: '$username',
                email: '$email',
                status: "$isIdVerified",
                avatar: '$avatar',
                createdAt:"$createdAt"
            }
            },
        );

        var firstmatch = [];
        if(search != null)
        {
            firstmatch.push({
                "$or":
                [
                    {
                        "username": 
                        {
                            $regex: search, 
                            $options: 'i'
                        }
                    },
                    {
                        "email": 
                        { 
                            $regex: search, 
                            $options: 'i' 
                        } 
                    },
                ]
            });
        }

        if(startdate != null && enddate != null)
        {
            var convertstart = startdate.split(" ")[0];
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));
            var convertend = currentdate.toISOString().split("T")[0];

            firstmatch.push({
                "$expr":
                {
                    "$and":
                    [
                        {
                            "$gte":
                            [
                                "$createdAt", convertstart
                            ],
                        },
                        {
                            "$lt":
                            [
                                "$createdAt", convertend
                            ]
                        }
                    ]
                }
            });
        }

        if(jabatan != null)
        {
            firstmatch.push({
                "group":
                {
                "$in":jabatan
                }
            });
        }

        if(divisi != null)
        {
            firstmatch.push({
                "namadivisi":
                {
                "$in":divisi
                }
            });
        }

        if(status != null)
        {
            firstmatch.push({
                "status":status
            });
        }

        if(firstmatch.length != 0)
        {
            pipeline.push({
                "$match":
                {
                "$and":firstmatch
                }
            });
        }

        if(ascending != null)
        {
            var konvertsort = null;
            if(ascending == true)
            {
                konvertsort = 1;
            }
            else
            {
                konvertsort = -1;
            }
            pipeline.push({
                "$sort":
                {
                "createdAt":konvertsort
                }
            });
        }

        if(skip != null && skip > 0)
        {
            pipeline.push({
                "$skip" : (skip * limit)
            });
        }

        if(limit != null && limit > 0)
        {
            pipeline.push({
                "$limit":limit
            });
        }

        var consol = require('util');
        console.log(consol.inspect(pipeline, { showHidden:false, depth:null, colors:true}))

        var data = await this.UserbasicnewModel.aggregate(pipeline);

        return data;
    }

    async listkycsummary2(startdate: string, enddate: string, jenisquery: string, keys: string, status: any[], descending: boolean, page: number, limit: number)
    {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));
      
            var dateend = currentdate.toISOString();
          } catch (e) {
            dateend = "";
        }

        var pipeline = [];
        var firstmatch = [];
        var order = null;

        firstmatch.push(
            {
                "kyc.valid":
                {
                    "$exists":true
                }
            },
            {
                "kyc.status":
                {
                    "$ne":null
                }
            },
            {
                "kyc.status":
                {
                    "$ne":""
                }
            }
        );

        if(startdate != null && startdate != undefined)
        {
            firstmatch.push(
                {
                    "kyc.createdAt":
                    {
                        "$gte":startdate
                    }
                }
            );
        }

        if(enddate != null && enddate != undefined)
        {
            firstmatch.push(
                {
                    "kyc.createdAt":
                    {
                        "$lte":dateend
                    }
                }
            );
        }

        pipeline.push(
            {
                "$unwind":
                {
                    path:"$kyc"
                }
            },
            {
                "$match":
                {
                    "$and":firstmatch
                }
            },
            {
                "$project":
                {
                    _id:1,
                    kyc:1,
                    email:1,
                    username:1,
                    userId:"$_id",
                    jumlahPermohonan:'1',
                    tahapan: "KTP",
                    avatar:
                    {
                        mediaBasePath:
                        {
                            "$ifNull":
                            [
                                "$mediaBasePath",
                                null
                            ]
                        },
                        mediaUri:
                        {
                            "$ifNull":
                            [
                                "$mediaUri",
                                null
                            ]
                        },
                        mediaType:
                        {
                            "$ifNull":
                            [
                                "$mediaType",
                                null
                            ]
                        },
                        mediaEndpoint:
                        {
                            "$ifNull":
                            [
                                "$mediaEndpoint",
                                null
                            ]
                        },
                    }
                }
            },
            {
                "$project":
                {
                    _id:1,
                    kyc:1,
                    email:1,
                    username:1,
                    userId:1,
                    jumlahPermohonan:1,
                    tahapan:1,
                    avatar:1,
                    kycHandle:
                    {
                        "$ifNull":
                        [
                            "$kyc.kycHandle",
                            []       
                        ]
                    },
                    idcardnumber:"$kyc.idcardnumber",
                    status:
                    {
                        '$switch': {
                          branches: [
                            {
                              case: { '$eq': [ '$kyc.status', 'IN_PROGGRESS' ] },
                              then: 'BARU'
                            },
                            {
                              case: { '$eq': [ '$kyc.status', 'FAILED' ] },
                              then: 'DITOLAK'
                            },
                            {
                              case: { '$eq': [ '$kyc.status', 'FINISH' ] },
                              then: 'BYSYSTEM'
                            },
                            {
                              case: { '$eq': [ '$kyc.status', 'DISETUJUI' ] },
                              then: 'DISETUJUI'
                            }
                          ],
                          default: ''
                        }
                    },
                    createdAt:"$kyc.createdAt",
                }
            }
        );

        if(jenisquery == 'summary')
        {
            pipeline.push(
                {
                    "$group":
                    {
                        _id:"$status",
                        myCount:
                        {
                            "$sum":1
                        }
                    }
                }
            );
        }
        else
        {
            if (keys != null && keys != undefined) {
                pipeline.push({
                    $match: {
            
                        username: {
                            $regex: keys, $options: 'i'
                        },
                    }
                });
            }
        
            if (status != null && status !== undefined) {
                pipeline.push(
                    {
                        $match: {
                            $or: [
                                {
                                    status: {
                                        $in: status
                                    }
                                },
                
                            ]
                        }
                    }
                );
            }
        
            if (descending === true) {
                order = -1;
            } else {
                order = 1;
            }
        
            pipeline.push(
                {
                    $sort: {
                        createdAt: order
                    },
                }
            );
        
            if (page > 0) {
                pipeline.push({ $skip: (page * limit) });
            }
        
            if (limit > 0) {
                pipeline.push({ $limit: limit });
            }
        }

        var query = await this.UserbasicnewModel.aggregate(pipeline);

        return query;
    }

}
