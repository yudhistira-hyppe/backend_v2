import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGetcontenteventsDto } from './dto/create-getcontentevents.dto';
import { ContenteventsService } from '../../../content/contentevents/contentevents.service';
import { CountriesService } from '../../../infra/countries/countries.service';
import { Getcontentevents, GetcontenteventsDocument } from './schemas/getcontentevents.schema';
import { MediaprofilepictsService } from '../../../content/mediaprofilepicts/mediaprofilepicts.service';

@Injectable()
export class GetcontenteventsService {
    constructor(
        @InjectModel(Getcontentevents.name, 'SERVER_FULL')
        private readonly getcontenteventsModel: Model<GetcontenteventsDocument>,
        private readonly contenteventsService: ContenteventsService,
        private readonly mediaprofilepictsService: MediaprofilepictsService,
        private readonly countriesService: CountriesService,
    ) { }

    async findgender(postID: string) {

        const query = await this.getcontenteventsModel.aggregate([


            {
                $lookup: {
                    from: "userbasics",
                    localField: "email",
                    foreignField: "email",
                    as: "field"
                }
            }, {
                $unwind: {
                    path: "$field",
                    preserveNullAndEmptyArrays: false
                }
            }, {
                $match: {
                    $or: [
                        {
                            eventType: "LIKE"
                        },
                        {
                            eventType: "COMMENT"
                        },
                        {
                            eventType: "VIEW"
                        }
                    ],
                    $and: [
                        // {
                        //     postID: "4f25546c-708c-4817-9890-9b9e228ecaf2"
                        // },
                        {
                            postID: postID
                        },
                        {
                            event: "DONE"
                        }
                    ]
                }
            }, {
                $group: {
                    _id: "$field.gender",
                    totalpost: {
                        $sum: 1
                    }
                }
            }
        ]);


        return query;
    }

    async findgender_perempuan(postID: string) {

        const query = await this.getcontenteventsModel.aggregate([


            {
                $lookup: {
                    from: "userbasics",
                    localField: "email",
                    foreignField: "email",
                    as: "field"
                }
            }, {
                $unwind: {
                    path: "$field",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $addFields: {
                    gender: '$field.gender',


                },
            },
            {
                $match: {
                    $or: [
                        {
                            eventType: "LIKE"
                        },
                        {
                            eventType: "COMMENT"
                        },
                        {
                            eventType: "VIEW"
                        },

                    ],
                    $and: [
                        {
                            postID: postID
                        },

                        {
                            event: "DONE"
                        }, {
                            gender: " Perempuan"
                        }
                    ]
                }
            }, {
                $group: {
                    _id: "$field.gender",
                    totalpost: {
                        $sum: 1
                    }
                }
            }
        ]);


        return query;
    }

    async findgenderMale(postID: string) {

        const query = await this.getcontenteventsModel.aggregate([


            {
                $lookup: {
                    from: "userbasics",
                    localField: "email",
                    foreignField: "email",
                    as: "field"
                }
            }, {
                $unwind: {
                    path: "$field",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $addFields: {
                    gender: '$field.gender',


                },
            },
            {
                $match: {
                    $or: [
                        {
                            eventType: "LIKE"
                        },
                        {
                            eventType: "COMMENT"
                        },
                        {
                            eventType: "VIEW"
                        },

                    ],
                    $and: [
                        {
                            postID: postID
                        },

                        {
                            event: "DONE"
                        }, {
                            gender: "MALE"
                        }
                    ]
                }
            }, {
                $group: {
                    _id: "$field.gender",
                    totalpost: {
                        $sum: 1
                    }
                }
            }
        ]);


        return query;
    }

    async findgenderFeMale(postID: string) {

        const query = await this.getcontenteventsModel.aggregate([


            {
                $lookup: {
                    from: "userbasics",
                    localField: "email",
                    foreignField: "email",
                    as: "field"
                }
            }, {
                $unwind: {
                    path: "$field",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $addFields: {
                    gender: '$field.gender',


                },
            },
            {
                $match: {
                    $or: [
                        {
                            eventType: "LIKE"
                        },
                        {
                            eventType: "COMMENT"
                        },
                        {
                            eventType: "VIEW"
                        },

                    ],
                    $and: [
                        {
                            postID: postID
                        },

                        {
                            event: "DONE"
                        }, {
                            gender: "FEMALE"
                        }
                    ]
                }
            }, {
                $group: {
                    _id: "$field.gender",
                    totalpost: {
                        $sum: 1
                    }
                }
            }
        ]);


        return query;
    }

    async findgender_laki(postID: string) {

        const query = await this.getcontenteventsModel.aggregate([


            {
                $lookup: {
                    from: "userbasics",
                    localField: "email",
                    foreignField: "email",
                    as: "field"
                }
            }, {
                $unwind: {
                    path: "$field",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $addFields: {
                    gender: '$field.gender',


                },
            },
            {
                $match: {
                    $or: [
                        {
                            eventType: "LIKE"
                        },
                        {
                            eventType: "COMMENT"
                        },
                        {
                            eventType: "VIEW"
                        },

                    ],
                    $and: [
                        {
                            postID: postID
                        },

                        {
                            event: "DONE"
                        }, {
                            gender: "Laki-laki"
                        }
                    ]
                }
            }, {
                $group: {
                    _id: "$field.gender",
                    totalpost: {
                        $sum: 1
                    }
                }
            }
        ]);


        return query;
    }

    async findgender_FeMale(postID: string) {

        const query = await this.getcontenteventsModel.aggregate([


            {
                $lookup: {
                    from: "userbasics",
                    localField: "email",
                    foreignField: "email",
                    as: "field"
                }
            }, {
                $unwind: {
                    path: "$field",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $addFields: {
                    gender: '$field.gender',


                },
            },
            {
                $match: {
                    $or: [
                        {
                            eventType: "LIKE"
                        },
                        {
                            eventType: "COMMENT"
                        },
                        {
                            eventType: "VIEW"
                        },

                    ],
                    $and: [
                        {
                            postID: postID
                        },

                        {
                            event: "DONE"
                        }, {
                            gender: " FEMALE"
                        }
                    ]
                }
            }, {
                $group: {
                    _id: "$field.gender",
                    totalpost: {
                        $sum: 1
                    }
                }
            }
        ]);


        return query;
    }

    async findall(postID: string) {

        const query = await this.getcontenteventsModel.aggregate([


            {
                $lookup: {
                    from: "userbasics",
                    localField: "email",
                    foreignField: "email",
                    as: "field"
                }
            }, {
                $unwind: {
                    path: "$field",
                    preserveNullAndEmptyArrays: false
                }
            }, {
                $match: {
                    $or: [
                        {
                            eventType: "LIKE"
                        },
                        {
                            eventType: "COMMENT"
                        },
                        {
                            eventType: "VIEW"
                        }
                    ],
                    $and: [
                        // {
                        //     postID: "4f25546c-708c-4817-9890-9b9e228ecaf2"
                        // },
                        {
                            postID: postID
                        },
                        {
                            event: "DONE"
                        }
                    ]
                }
            },
        ]);


        return query;
    }

    async findage1440(postID: string) {

        const query = await this.getcontenteventsModel.aggregate([


            {
                $lookup: {
                    from: "userbasics",
                    localField: "email",
                    foreignField: "email",
                    as: "field"
                }
            }, {
                $unwind: {
                    path: "$field",
                    preserveNullAndEmptyArrays: false
                }
            }, {
                $addFields: {

                    age: {
                        $round: [{
                            $divide: [{
                                $subtract: [new Date(), {
                                    $toDate: '$field.dob'
                                }]
                            }, (365 * 24 * 60 * 60 * 1000)]
                        }]
                    }
                },
            }, {
                $match: {
                    $or: [
                        {
                            eventType: "LIKE"
                        },
                        {
                            eventType: "COMMENT"
                        },
                        {
                            eventType: "VIEW"
                        }
                    ],
                    $and: [
                        {
                            postID: postID
                        },
                        {
                            event: "DONE"
                        },
                        {
                            age: { $gt: 13, $lt: 41 }
                        }


                    ]
                }
            }, {
                $group: {
                    _id: "$age",
                    totalpost: {
                        $sum: 1
                    }
                },
            }
        ]);


        return query;
    }

    async findage40(postID: string) {

        const query = await this.getcontenteventsModel.aggregate([


            {
                $lookup: {
                    from: "userbasics",
                    localField: "email",
                    foreignField: "email",
                    as: "field"
                }
            }, {
                $unwind: {
                    path: "$field",
                    preserveNullAndEmptyArrays: false
                }
            }, {
                $addFields: {

                    age: {
                        $round: [{
                            $divide: [{
                                $subtract: [new Date(), {
                                    $toDate: '$field.dob'
                                }]
                            }, (365 * 24 * 60 * 60 * 1000)]
                        }]
                    }
                },
            }, {
                $match: {
                    $or: [
                        {
                            eventType: "LIKE"
                        },
                        {
                            eventType: "COMMENT"
                        },
                        {
                            eventType: "VIEW"
                        }
                    ],
                    $and: [
                        {
                            postID: postID
                        },
                        {
                            event: "DONE"
                        },
                        {
                            age: { $gt: 40 }
                        }


                    ]
                }
            }, {
                $group: {
                    _id: "$age",
                    totalpost: {
                        $sum: 1
                    }
                },
            }
        ]);


        return query;
    }

    async findage14(postID: string) {

        const query = await this.getcontenteventsModel.aggregate([


            {
                $lookup: {
                    from: "userbasics",
                    localField: "email",
                    foreignField: "email",
                    as: "field"
                }
            }, {
                $unwind: {
                    path: "$field",
                    preserveNullAndEmptyArrays: false
                }
            }, {
                $addFields: {

                    age: {
                        $round: [{
                            $divide: [{
                                $subtract: [new Date(), {
                                    $toDate: '$field.dob'
                                }]
                            }, (365 * 24 * 60 * 60 * 1000)]
                        }]
                    }
                },
            }, {
                $match: {
                    $or: [
                        {
                            eventType: "LIKE"
                        },
                        {
                            eventType: "COMMENT"
                        },
                        {
                            eventType: "VIEW"
                        }
                    ],
                    $and: [
                        {
                            postID: postID
                        },
                        {
                            event: "DONE"
                        },
                        {
                            age: { $lt: 14 }
                        }


                    ]
                }
            }, {
                $group: {
                    _id: "$age",
                    totalpost: {
                        $sum: 1
                    }
                },
            }
        ]);


        return query;
    }
    async findlocation(postID: string) {

        const query = await this.getcontenteventsModel.aggregate([

            {
                $lookup: {
                    from: "userbasics",
                    localField: "email",
                    foreignField: "email",
                    as: "field"
                }
            },
            {
                $lookup: {
                    from: 'countries',
                    localField: 'field.countries.$id',
                    foreignField: '_id',
                    as: 'countries_data',

                },

            },
            {
                "$unwind": {
                    "path": "$countries_data",
                    "preserveNullAndEmptyArrays": false
                }
            },
            {
                $match: {
                    $or: [
                        {
                            eventType: "LIKE"
                        },
                        {
                            eventType: "COMMENT"
                        },
                        {
                            eventType: "VIEW"
                        }
                    ],
                    $and: [
                        {
                            postID: postID
                        },
                        {
                            event: "DONE"
                        },


                    ]
                }
            },
            {
                $group: {
                    _id: "$countries_data.country",
                    totalpost: {
                        $sum: 1
                    }
                }
            }
        ]);


        return query;
    }

    async findfollower(email: string, year: number) {


        const query = await this.getcontenteventsModel.aggregate([


            {
                $match: {
                    email: email,
                    eventType: "FOLLOWER",
                    event: "ACCEPT",
                    $expr: { $eq: [year, { $year: new Date() }] }
                }
            },
            {
                $project: {

                    month_repo: {
                        $toInt: {
                            $substrCP: ['$createdAt', 5, 2]
                        }
                    },
                    YearcreatedAt_repo: {
                        $toInt: {
                            $substrCP: ['$createdAt', 0, 4]
                        }
                    },
                    year_param_repo: {
                        $toInt: year
                    },

                },

            },
            {
                $group: {
                    _id: {
                        month_group: '$month_repo',

                    },
                    activityType_Count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    month: '$_id.month_group',

                    count: { $sum: '$activityType_Count' },
                },
            },
            {
                $sort: { month: 1 },
            },
        ]);



        return query;
    }

    async findfollowerall(email: string) {



        const query = await this.getcontenteventsModel.aggregate([


            {
                $match: {
                    email: email, eventType: "FOLLOWER", event: "ACCEPT"
                }
            }, {
                $group: {
                    _id: "$email",
                    totalfollowerall: {
                        $sum: 1
                    }
                }
            }
        ]);



        return query;
    }

    async getConteneventbyType(CreateGetcontenteventsDto_: CreateGetcontenteventsDto): Promise<any[]> {
        const getcontenteventsModel = await this.contenteventsService.getConteneventbyType(CreateGetcontenteventsDto_);
        return getcontenteventsModel;
    }

    async getConteneventbyType2(CreateGetcontenteventsDto_: CreateGetcontenteventsDto): Promise<any[]> {
        const getcontenteventsModel = await this.getcontenteventsModel.aggregate(
            [
                {
                    "$match":
                    {
                        "$and":
                        [
                            {
                                "active":CreateGetcontenteventsDto_.active,
                            },
                            {
                                "postID":CreateGetcontenteventsDto_.postID
                            },
                            {
                                "receiverParty":CreateGetcontenteventsDto_.receiverParty
                            },
                            {
                                "eventType":CreateGetcontenteventsDto_.eventType
                            }
                        ]
                    }
                },
                {
                    "$skip":(CreateGetcontenteventsDto_.skip * CreateGetcontenteventsDto_.limit)
                },
                {
                    "$limit":CreateGetcontenteventsDto_.limit
                },
                {
                    "$lookup":
                    {
                        from:"userbasics",
                        as:"basic_data",
                        let:
                        {
                            email_fk:"$email"
                        },
                        pipeline:
                        [
                            {
                                "$match":
                                {
                                    "$expr":
                                    {
                                        "$eq":
                                        [
                                            "$email","$$email_fk"
                                        ]
                                    }
                                }
                            },
                            {
                                "$project":
                                {
                                    "_id":1,
                                    "profilePict":"$profilePict.$id",
                                    "userAuth":"$userAuth.$id",
                                    "email":1,
                                    "fullName":1,
                                    "urluserBadge":
                                    {
                                        "$ifNull":
                                        [
                                            {
                                                "$filter":
                                                {
                                                    input:"$userBadge",
                                                    as:"listbadge",
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
                                                                "$lte": 
                                                                [
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
                                                }
                                            },
                                            []
                                        ]
                                    },
                                }
                            },
                            {
                                "$project":
                                {
                                    "_id":1,
                                    "profilePict":1,
                                    "userAuth":1,
                                    "email":1,
                                    "fullName":1,
                                    "urluserBadge":
                                    {
                                        "$ifNull":
                                        [
                                            {
                                                "$arrayElemAt":
                                                [
                                                    "$urluserBadge",0
                                                ]
                                            },
                                            null
                                        ]
                                    },
                                }
                            },
                            {
                                "$lookup":
                                {
                                    from:"userauths",
                                    localField:"userAuth",
                                    foreignField:"_id",
                                    as:"username"
                                }
                            },
                            {
                                "$lookup":
                                {
                                    from:"mediaprofilepicts",
                                    localField:"profilePict",
                                    foreignField:"_id",
                                    as:"avatar"
                                }
                            },
                            {
                                "$project":
                                {
                                    "_id":1,
                                    "email":1,
                                    "fullName":1,
                                    "urluserBadge":1,
                                    "username":
                                    {
                                        "$ifNull":
                                        [
                                            {
                                                "$arrayElemAt":
                                                [
                                                    "$username.username",0
                                                ]
                                            },
                                            null
                                        ]
                                    },
                                    "avatar":
                                    {
                                        "$cond":
                                        {
                                            if:
                                            {
                                                "$eq":
                                                [
                                                    {
                                                        "$size":"$avatar"
                                                    },
                                                    0
                                                ]
                                            },
                                            then:null,
                                            else:
                                            {
                                                "mediaBasePath":
                                                {
                                                    "$ifNull":
                                                    [
                                                        {
                                                            "$arrayElemAt":
                                                            [
                                                                "$avatar.mediaBasePath", 0
                                                            ]
                                                        },
                                                        null
                                                    ]
                                                },
                                                "mediaUri":
                                                {
                                                    "$ifNull":
                                                    [
                                                        {
                                                            "$arrayElemAt":
                                                            [
                                                                "$avatar.mediaUri", 0
                                                            ]
                                                        },
                                                        null
                                                    ]
                                                },
                                                "mediaType":
                                                {
                                                    "$ifNull":
                                                    [
                                                        {
                                                            "$arrayElemAt":
                                                            [
                                                                "$avatar.mediaType", 0
                                                            ]
                                                        },
                                                        null
                                                    ]
                                                },
                                                "mediaEndpoint":
                                                {
                                                    "$ifNull":
                                                    [
                                                        {
                                                            "$concat":
                                                            [
                                                                '/profilepict/',
                                                                {
                                                                    "$arrayElemAt":
                                                                    [
                                                                        "$avatar.mediaID", 0
                                                                    ]
                                                                },
                                                            ]
                                                        },
                                                        null
                                                    ]
                                                },
                                                "profilePict_id":
                                                {
                                                    "$ifNull":
                                                    [
                                                        {
                                                            "$arrayElemAt":
                                                            [
                                                                "$avatar._id", 0
                                                            ]
                                                        },
                                                        null
                                                    ]
                                                },
                                            }
                                        }
                                    }
                                }
                            }
                        ]
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
                        "_id":0,
                        "email":"$basic_data.email",
                        "fullName":"$basic_data.fullName",
                        "urluserBadge":"$basic_data.urluserBadge",
                        "username":"$basic_data.username",
                        "avatar":"$basic_data.avatar"
                    }
                }
            ]
        )
        return getcontenteventsModel;
    }


    async findAllviewlike(CreateGetcontenteventsDto_: CreateGetcontenteventsDto): Promise<Getcontentevents[]> {


        var receiverParty = CreateGetcontenteventsDto_.receiverParty;
        const query = await this.getcontenteventsModel.aggregate([
            {
                $match: {
                    postID: CreateGetcontenteventsDto_.postID,
                    eventType: CreateGetcontenteventsDto_.eventType,
                    receiverParty: CreateGetcontenteventsDto_.receiverParty,
                }
            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "email",
                    foreignField: "email",
                    as: "userbasics"
                }
            },
            {
                $lookup: {
                    from: "userauths",
                    localField: "email",
                    foreignField: "email",
                    as: "userauths"
                }
            },
            {
                $project: {
                    _id: 0,
                    userbasics: { $arrayElemAt: ['$userbasics', 0] },
                    userauths: { $arrayElemAt: ['$userauths', 0] },
                },
            },
            {
                $addFields: {
                    profilePict_id: '$userbasics.profilePict.$id',
                },

            },
            {
                $lookup: {
                    from: 'mediaprofilepicts',
                    localField: 'profilePict_id',
                    foreignField: '_id',
                    as: 'profilePict_data',
                },
            },
            {
                $project: {
                    _id: 0,
                    profilePict: { $arrayElemAt: ['$profilePict_data', 0] },
                    userbasics: '$userbasics',
                    userauths: '$userauths',
                },
            },
            {
                $project: {
                    _id: 0,
                    fullName: '$userbasics.fullName',
                    email: '$userbasics.email',
                    username: '$userauths.username',
                    avatar: {
                        profilePict_id: '$profilePict._id',
                        mediaBasePath: '$profilePict.mediaBasePath',
                        mediaUri: '$profilePict.mediaUri',
                        mediaType: '$profilePict.mediaType',
                        mediaEndpoint: { $concat: ['/profilepict/', '$profilePict._id'] },

                    }
                },
            },
            { $sort: { fullName: 1 } },
            { $skip: CreateGetcontenteventsDto_.skip },
            { $limit: CreateGetcontenteventsDto_.limit },
        ]);


        return query;
        //return this.getcontenteventsModel.find(CreateGetcontenteventsDto_).exec();
    }
    
    async findByPostID(postIDs:Array<String>,eventTypes:Array<String>){        
        const query=await this.getcontenteventsModel.aggregate([
            {
                "$lookup" : {
                    "localField" : "email",
                    "from" : "userbasics",
                    "foreignField" : "email",
                    "as" : "userbasics"
                }
            }, 
            {
                "$match" : {
                    "postID" : {
                        "$in" : postIDs
                    },
                    "eventType" : {"$in":eventTypes}
                }
            },
            {
                 "$project":{
                     "contentEventID" : 1,
                    "email" : 1,
                    "eventType" : 1,
                    "active" : 1,
                    "event" : 1,
                    "createdAt" : 1,
                    "updatedAt" : 1,
                    "senderParty" : 1,
                    "postID" : 1,
                    "gender":"$userbasics.gender"
                 }   
            }
        ]);

        return query;
    }
    async findByReceiverParty(email:String,eventTypes:Array<String>){
        const query=await this.getcontenteventsModel.find(
            {"eventType":{$in:["VIEW_PROFILE"]},"receiverParty":"freeman27@getnada.com"}
        );
        return query;
    }
    async groupEventsBy(events:Array<any>,groupBy:String){
        if(groupBy=='gender'){
            var byGenders=[];
            for(var i=0;i<events.length;i++){
                if(events[i].gender[0]==null)
                    continue;
                var idx=byGenders.findIndex(x => x.gender==events[i].gender[0]);
                if(idx==-1){
                    byGenders.push({'gender':events[i].gender[0],'count':1});
                }
                else{
                    byGenders[idx].count++;
                }
            }
            return byGenders;
        }
        else if(groupBy=='genderp'){
            var byGenders=[];
            var totalCount=0;
            for(var i=0;i<events.length;i++){
                if(events[i].gender[0]==null)
                    continue;
                var idx=byGenders.findIndex(x => x.gender==events[i].gender[0]);
                if(idx==-1){
                    byGenders.push({'gender':events[i].gender[0],'count':1,'percentage':0});
                }
                else{
                    byGenders[idx].count++;
                }
                totalCount++;
            }
            for(var i=0;i<byGenders.length;i++){
                byGenders[i].percentage=byGenders[i].count/totalCount*100;
            }
            return byGenders;
        }
        else if(groupBy=='ym'){
            var byYms=[];

            for(var i=0;i<events.length;i++){
                var ym=events[i].createdAt.substring(0,7);

                var idx=byYms.findIndex(x => x.ym==ym);
                if(idx==-1){
                    byYms.push({'ym':ym,'count':1});
                }
                else{
                    byYms[idx].count++;
                }
            }
            if(byYms.length>0){
                var startYm=byYms[0].ym;
                var endYm=byYms[byYms.length-1].ym;
                var currYm=byYms[0].ym;
                var i=0;
                var allYms=[startYm];
                // var maxi=10;
                console.log("currYm "+currYm+" ");
                while(true){
                    var currYear=currYm.substr(0,4);
                    var currMonth=currYm.substr(-2);
                    console.log("currYear: "+currYear+" currMonth: "+currMonth);
                    var nextMonth=parseInt(currMonth)+1;
                    console.log("nextMonth: "+nextMonth);
                    if(nextMonth>12){
                        currYm=(parseInt(currYear)+1).toString()+"-01";
                    }
                    else{
                        currYm=currYear.toString()+"-"+nextMonth.toString().padStart(2,'0');
                    }
                    console.log("is "+currYm+" ");
                    allYms.push(currYm);
                    i++;
                    if(currYm==endYm)
                        break;

                }
                allYms.forEach(currym=>{
                    if(byYms.some(e => e.ym==currym)){

                    }
                    else{
                        byYms.push({'ym':currym,'count':0})
                    }
                });
                byYms.sort((a,b)=>(a.ym>=b.ym)?1:-1);
            }
            

            return byYms;
        }
        else if(groupBy=='date'){
            var byDates=[];
            for(var i=0;i<events.length;i++){
                var dt=events[i].createdAt.substring(0,10);
                var idx=byDates.findIndex(x => x.date==dt);
                if(idx==-1){
                    byDates.push({'date':dt,'count':1});
                }
                else{
                    byDates[idx].count++;
                }
            }
            return byDates;
        }
    }
    
}
