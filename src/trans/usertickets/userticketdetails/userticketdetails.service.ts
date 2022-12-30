import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { MediaprofilepictsService } from '../../../content/mediaprofilepicts/mediaprofilepicts.service';
import { CreateUserticketdetailsDto } from './dto/create-userticketdetails.dto';
import { Userticketdetails, UserticketdetailsDocument } from './schemas/userticketdetails.schema';
@Injectable()
export class UserticketdetailsService {
    constructor(
        @InjectModel(Userticketdetails.name, 'SERVER_FULL')
        private readonly userticketsModel: Model<UserticketdetailsDocument>,
        private readonly mediaprofilepictsService: MediaprofilepictsService,

    ) { }
    async create(CreateUserticketdetailsDto: CreateUserticketdetailsDto): Promise<Userticketdetails> {
        let data = await this.userticketsModel.create(CreateUserticketdetailsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }
    async findOne(id: ObjectId): Promise<Userticketdetails[]> {
        return this.userticketsModel.find({ _id: id }).exec();
    }
    async findOneid(id: string): Promise<Userticketdetails> {
        return this.userticketsModel.findOne({ _id: id }).exec();
    }
    async findOneType(id: ObjectId, type: string): Promise<Userticketdetails[]> {

        return this.userticketsModel.find({ IdUserticket: id, type: type }).exec();
    }
    async detailKomentar(id: object, type: string): Promise<object> {

        const query = await this.userticketsModel.aggregate([
            {
                $lookup: {
                    from: "userbasics",
                    localField: "IdUser",
                    foreignField: "_id",
                    as: "userdata"
                }
            },
            {
                $lookup: {
                    from: "usertickets",
                    localField: "IdUserticket",
                    foreignField: "_id",
                    as: "tiketdata"
                }
            },

            {
                $project: {
                    userdata: {
                        $arrayElemAt: ['$userdata', 0]
                    },
                    tiketdata: {
                        $arrayElemAt: ['$tiketdata', 0]
                    },
                    "profilpictid": '$userdata.profilePict.$id',
                    "IdUserticket": "$IdUserticket",
                    "type": "$type",
                    "body": "$body",
                    "datetime": "$datetime",
                    "IdUser": "$IdUser",
                    "status": "$status",


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
                    "fullName": "$userdata.fullName",
                    "email": "$userdata.email",
                    "IdUserticket": "$IdUserticket",
                    "type": "$type",
                    "body": "$body",
                    "datetime": "$datetime",
                    "IdUser": "$IdUser",
                    "status": "$status",
                    "tiketdata": "$tiketdata"
                }
            },

            {
                $addFields: {

                    concats: '/profilepict',
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


                    "fullName": "$fullName",
                    "email": "$email",
                    "IdUserticket": "$IdUserticket",
                    "type": "$type",
                    "body": "$body",
                    "datetime": "$datetime",
                    "IdUser": "$IdUser",
                    "status": "$status",
                    "tiketdata": "$tiketdata",
                    avatar: {
                        mediaBasePath: '$profilpict.mediaBasePath',
                        mediaUri: '$profilpict.mediaUri',
                        mediaType: '$profilpict.mediaType',
                        mediaEndpoint: {
                            $concat: ["$concats", "/", "$pict"]
                        },

                    },
                }
            },
            {
                $match: {
                    "type": type, "tiketdata._id": id
                }
            }
        ]);


        return query;
    }


    async detailKomentarChat(id: object, type: string): Promise<any[]> {

        const query = await this.userticketsModel.aggregate([
            {
                $lookup: {
                    from: "userbasics",
                    localField: "IdUser",
                    foreignField: "_id",
                    as: "userdata"
                }
            },


            {
                $project: {
                    userdata: {
                        $arrayElemAt: ['$userdata', 0]
                    },
                    tiketdata: {
                        $arrayElemAt: ['$tiketdata', 0]
                    },
                    "profilpictid": '$userdata.profilePict.$id',
                    "IdUserticket": "$IdUserticket",
                    "type": "$type",
                    "body": "$body",
                    "datetime": "$datetime",
                    "IdUser": "$IdUser",
                    "status": "$status",
                    "mediaUri": '$mediaUri',
                    "originalName": '$originalName',
                    "fsSourceUri": '$fsSourceUri',
                    "fsSourceName": '$fsSourceName',
                    "fsTargetUri": '$fsTargetUri',
                    "mediaBasePath": '$mediaBasePath',
                    "mediaMime": '$mediaMime',
                    "mediaType": '$mediaType',


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
                    "fullName": "$userdata.fullName",
                    "email": "$userdata.email",
                    "IdUserticket": "$IdUserticket",
                    "type": "$type",
                    "body": "$body",
                    "datetime": "$datetime",
                    "IdUser": "$IdUser",
                    "status": "$status",
                    "mediaUri": '$mediaUri',
                    "originalName": '$originalName',
                    "fsSourceUri": '$fsSourceUri',
                    "fsSourceName": '$fsSourceName',
                    "fsTargetUri": '$fsTargetUri',
                    "mediaBasePath": '$mediaBasePath',
                    "mediaMime": '$mediaMime',
                    "mediaType": '$mediaType',
                }
            },

            {
                $addFields: {

                    concats: '/profilepict',
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


                    "fullName": "$fullName",
                    "email": "$email",
                    "IdUserticket": "$IdUserticket",
                    "type": "$type",
                    "body": "$body",
                    "datetime": "$datetime",
                    "IdUser": "$IdUser",
                    "status": "$status",
                    "mediaUri": '$mediaUri',
                    "originalName": '$originalName',
                    "fsSourceUri": '$fsSourceUri',
                    "fsSourceName": '$fsSourceName',
                    "fsTargetUri": '$fsTargetUri',
                    "mediaBasePath": '$mediaBasePath',
                    "mediaMime": '$mediaMime',
                    "mediaType": '$mediaType',
                    avatar: {
                        mediaBasePath: '$profilpict.mediaBasePath',
                        mediaUri: '$profilpict.mediaUri',
                        mediaType: '$profilpict.mediaType',
                        mediaEndpoint: {
                            $concat: ["$concats", "/", "$pict"]
                        },

                    },
                }
            },

            {
                $match: {
                    "type": type, "IdUserticket": id
                }
            },
            { $sort: { datetime: 1 }, },
        ]);


        return query;
    }

    async detailKomentarChatNew(id: object): Promise<any[]> {

        const query = await this.userticketsModel.aggregate([
            {
                $lookup: {
                    from: "userbasics",
                    localField: "IdUser",
                    foreignField: "_id",
                    as: "userdata"
                }
            },


            {
                $project: {
                    userdata: {
                        $arrayElemAt: ['$userdata', 0]
                    },
                    tiketdata: {
                        $arrayElemAt: ['$tiketdata', 0]
                    },
                    "profilpictid": '$userdata.profilePict.$id',
                    "IdUserticket": "$IdUserticket",
                    "type": "$type",
                    "body": "$body",
                    "datetime": "$datetime",
                    "IdUser": "$IdUser",
                    "status": "$status",
                    "mediaUri": '$mediaUri',
                    "originalName": '$originalName',
                    "fsSourceUri": '$fsSourceUri',
                    "fsSourceName": '$fsSourceName',
                    "fsTargetUri": '$fsTargetUri',
                    "mediaBasePath": '$mediaBasePath',
                    "mediaMime": '$mediaMime',
                    "mediaType": '$mediaType',


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
                    "fullName": "$userdata.fullName",
                    "email": "$userdata.email",
                    "IdUserticket": "$IdUserticket",
                    "type": "$type",
                    "body": "$body",
                    "datetime": "$datetime",
                    "IdUser": "$IdUser",
                    "status": "$status",
                    "mediaUri": '$mediaUri',
                    "originalName": '$originalName',
                    "fsSourceUri": '$fsSourceUri',
                    "fsSourceName": '$fsSourceName',
                    "fsTargetUri": '$fsTargetUri',
                    "mediaBasePath": '$mediaBasePath',
                    "mediaMime": '$mediaMime',
                    "mediaType": '$mediaType',
                }
            },

            {
                $addFields: {

                    concats: '/profilepict',
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


                    "fullName": "$fullName",
                    "email": "$email",
                    "IdUserticket": "$IdUserticket",
                    "type": "$type",
                    "body": "$body",
                    "datetime": "$datetime",
                    "IdUser": "$IdUser",
                    "status": "$status",
                    "mediaUri": '$mediaUri',
                    "originalName": '$originalName',
                    "fsSourceUri": '$fsSourceUri',
                    "fsSourceName": '$fsSourceName',
                    "fsTargetUri": '$fsTargetUri',
                    "mediaBasePath": '$mediaBasePath',
                    "mediaMime": '$mediaMime',
                    "mediaType": '$mediaType',
                    avatar: {
                        mediaBasePath: '$profilpict.mediaBasePath',
                        mediaUri: '$profilpict.mediaUri',
                        mediaType: '$profilpict.mediaType',
                        mediaEndpoint: {
                            $concat: ["$concats", "/", "$pict"]
                        },

                    },
                }
            },

            {
                $match: {
                    "IdUserticket": id
                }
            },
            { $sort: { datetime: 1 }, },
            { $limit: 1 }
        ]);


        return query;
    }
    async updatedata(
        id: string,
        CreateUserticketdetailsDto: CreateUserticketdetailsDto,
    ): Promise<Userticketdetails> {
        let data = await this.userticketsModel.findByIdAndUpdate(
            id,
            CreateUserticketdetailsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }
}
