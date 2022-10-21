import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CreateLogticketsDto } from './dto/create-logtickets.dto';
import { Logtickets, LogticketsDocument } from './schemas/logtickets.schema';
import { MediaprofilepictsService } from '../../content/mediaprofilepicts/mediaprofilepicts.service';
@Injectable()
export class LogticketsService {

    constructor(
        @InjectModel(Logtickets.name, 'SERVER_FULL')
        private readonly logticketsModel: Model<LogticketsDocument>, private readonly mediaprofilepictsService: MediaprofilepictsService,
    ) { }
    async findAll(): Promise<Logtickets[]> {
        return this.logticketsModel.find().exec();
    }

    async findOne(id: string): Promise<Logtickets> {
        return this.logticketsModel.findOne({ _id: id }).exec();
    }

    async findbyidticket(id: object): Promise<object> {
        const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
        const query = await this.logticketsModel.aggregate([
            {
                $lookup: {
                    from: "userbasics",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userdata"
                }
            },
            {
                $lookup: {
                    from: "usertickets",
                    localField: "ticketId",
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
                    "ticketId": "$ticketId",
                    "createdAt": "$createdAt",
                    "remark": "$remark",
                    "type": "$type"
                }
            },
            {
                $lookup: {
                    from: 'mediaprofilepicts2',
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
                    "ticketId": "$ticketId",
                    "createdAt": "$createdAt",
                    "remark": "$remark",
                    "type": "$type",
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
                    "ticketId": "$ticketId",
                    "createdAt": "$createdAt",
                    "remark": "$remark",
                    "type": "$type",
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
                    "ticketId": id
                }
            }
        ]);


        return query;
    }
    async create(CreateLogticketsDto: CreateLogticketsDto): Promise<Logtickets> {
        let data = await this.logticketsModel.create(CreateLogticketsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

}
