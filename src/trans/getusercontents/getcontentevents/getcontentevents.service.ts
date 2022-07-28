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
        @InjectModel(Getcontentevents.name, 'SERVER_TRANS')
        private readonly getcontenteventsModel: Model<GetcontenteventsDocument>,
        private readonly contenteventsService: ContenteventsService, 
        private readonly mediaprofilepictsService: MediaprofilepictsService,
        private readonly countriesService: CountriesService,
    ) { }

    async findgender(postID: string) {
        const posts = await this.contenteventsService.findcontent();
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
        const posts = await this.contenteventsService.findcontent();
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
        const posts = await this.contenteventsService.findcontent();
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
        const posts = await this.contenteventsService.findcontent();
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
        const posts = await this.contenteventsService.findcontent();
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
        const posts = await this.contenteventsService.findcontent();
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
        const posts = await this.contenteventsService.findcontent();
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
        const posts = await this.contenteventsService.findcontent();
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
        const posts = await this.contenteventsService.findcontent();
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
        const posts = await this.contenteventsService.findcontent();
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
        const countries = await this.countriesService.findcountries();
        const posts = await this.contenteventsService.findcontent();
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
                    from: 'countries2',
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
        const posts = await this.contenteventsService.findcontent();

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
        const posts = await this.contenteventsService.findcontent();


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


    async findAllviewlike(CreateGetcontenteventsDto_: CreateGetcontenteventsDto): Promise<Getcontentevents[]> {
        await this.contenteventsService.findcontent();
        await this.mediaprofilepictsService.findmediaprofil();
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
                    from: 'mediaprofilepicts2',
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
                        profilePict_id:'$profilePict._id',
                        mediaBasePath: '$profilePict.mediaBasePath',
                        mediaUri: '$profilePict.mediaUri',
                        mediaType: '$profilePict.mediaType',
                        mediaEndpoint: '$profilePict.fsTargetUri',
                        medreplace: { $replaceOne: { input: "$profilePict.mediaUri", find: "_0001.jpeg", replacement: "" } },

                    }
                },
            },
        ]);


        return query;
        //return this.getcontenteventsModel.find(CreateGetcontenteventsDto_).exec();
    }
}
