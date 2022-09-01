import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { Model, Types } from 'mongoose';
import { CreateUserAdsDto } from './dto/create-userads.dto';
import { UserAds, UserAdsDocument } from './schemas/userads.schema';
import { MediaprofilepictsService } from '../../content/mediaprofilepicts/mediaprofilepicts.service';
@Injectable()
export class UserAdsService {
    constructor(@InjectModel(UserAds.name, 'SERVER_TRANS')
    private readonly userAdsModel: Model<UserAdsDocument>, private readonly mediaprofilepictsService: MediaprofilepictsService,
    ) { }

    async create(CreateUserAdsDto: CreateUserAdsDto): Promise<UserAds> {
        const createUserbasicDto = await this.userAdsModel.create(
            CreateUserAdsDto,
        );
        return createUserbasicDto;
    }

    async findAll(): Promise<UserAds[]> {
        return this.userAdsModel.find().exec();
    }

    async findAllLimit(limit:number): Promise<UserAds[]> {
        return this.userAdsModel.find().sort({ priorityNumber: 1 }).limit(limit).exec();
    }

    async findOne(id: string): Promise<UserAds> {
        return this.userAdsModel.findOne({ _id: new ObjectId(id) }).exec();
    }

    async findOneByuserID(userID: string): Promise<UserAds[]> {
        return this.userAdsModel.find({ userID: userID, statusView: false }).sort({ priorityNumber:-1, createdAt: -1 }).exec();
    }

    async findOneByuserIDAds(userID: string, adsId: string): Promise<UserAds> {
        return this.userAdsModel.findOne({ userID: userID, adsID: adsId, statusView: false }).exec();
    }

    // async findAdsid(adsID: ObjectId): Promise<UserAds> {
    //     return this.userAdsModel.findOne({ adsID: adsID }).exec();
    // }

    async findAdsid(adsID: ObjectId) {
        const query = await this.userAdsModel.aggregate([

            {
                $match: {
                    adsID: adsID
                }
            },

        ]);
        return query;
    }
    async update(
        adsID: string,
        createUserAdsDto: CreateUserAdsDto,
    ): Promise<UserAds> {
        let data = await this.userAdsModel.findByIdAndUpdate(
            adsID,
            createUserAdsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }
    async updatesdata(adsID: Types.ObjectId, createUserAdsDto: CreateUserAdsDto): Promise<Object> {
        let data = await this.userAdsModel.updateOne({ "adsID": adsID },
            { $set: { "statusClick": createUserAdsDto.statusClick, "statusView": createUserAdsDto.statusView, "viewAt": createUserAdsDto.viewAt, "viewed": createUserAdsDto.viewed, "clickAt": createUserAdsDto.clickAt } });
        return data;
    }

    async useradslistbyads(adsID: Types.ObjectId) {

        const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
        const query = await this.userAdsModel.aggregate([

            {
                $match: {
                    "adsID": adsID
                }
            }, {
                $lookup: {
                    from: 'userbasics',
                    localField: 'userID',
                    foreignField: '_id',
                    as: 'userbasics_data',

                },

            }, {
                $project: {
                    user: {
                        $arrayElemAt: ['$userbasics_data', 0]
                    },
                    clickAt: '$clickAt',
                    createdAt: '$createdAt',
                    description: '$description',
                    priority: '$priority',
                    statusClick: '$statusClick',
                    statusView: '$statusView',
                    updatedAt: '$updatedAt',
                    viewAt: '$viewAt',
                    viewed: '$viewed'
                }
            }, {
                $project: {

                    profilpictid: '$user.profilePict.$id',
                    fullName: '$user.fullName',
                    clickAt: '$clickAt',
                    createdAt: '$createdAt',
                    description: '$description',
                    priority: '$priority',
                    statusClick: '$statusClick',
                    statusView: '$statusView',
                    updatedAt: '$updatedAt',
                    viewAt: '$viewAt',
                    viewed: '$viewed'
                }
            }, {
                $lookup: {
                    from: 'mediaprofilepicts2',
                    localField: 'profilpictid',
                    foreignField: '_id',
                    as: 'profilePict_data',

                },

            }, {
                $project: {
                    profilpict: {
                        $arrayElemAt: ['$profilePict_data', 0]
                    },
                    fullName: '$fullName',
                    clickAt: '$clickAt',
                    createdAt: '$createdAt',
                    description: '$description',
                    priority: '$priority',
                    statusClick: '$statusClick',
                    statusView: '$statusView',
                    updatedAt: '$updatedAt',
                    viewAt: '$viewAt',
                    viewed: '$viewed',
                    avatar: {
                        mediaBasePath: '$profilpict.mediaBasePath',
                        mediaUri: '$profilpict.mediaUri',
                        mediaType: '$profilpict.mediaType',
                        mediaEndpoint: '$profilpict.fsTargetUri',
                        medreplace: {
                            $replaceOne: {
                                input: "$profilpict.mediaUri",
                                find: "_0001.jpeg",
                                replacement: ""
                            }
                        },

                    },
                }
            }, {
                $addFields: {

                    concat: '/profilepict',
                    pict: {
                        $replaceOne: {
                            input: "$profilpict.mediaUri",
                            find: "_0001.jpeg",
                            replacement: ""
                        }
                    },

                },

            }, {
                $project: {
                    fullName: '$fullName',
                    clickAt: '$clickAt',
                    createdAt: '$createdAt',
                    description: '$description',
                    priority: '$priority',
                    statusClick: '$statusClick',
                    statusView: '$statusView',
                    updatedAt: '$updatedAt',
                    viewAt: '$viewAt',
                    viewed: '$viewed',
                    concat: '$concat',
                    pict: '$pict',
                    avatar: {
                        mediaBasePath: '$profilpict.mediaBasePath',
                        mediaUri: '$profilpict.mediaUri',
                        mediaType: '$profilpict.mediaType',
                        mediaEndpoint: '$profilpict.fsTargetUri',
                        medreplace: {
                            $replaceOne: {
                                input: "$profilpict.mediaUri",
                                find: "_0001.jpeg",
                                replacement: ""
                            }
                        },

                    },

                }
            },
            {
                $project: {
                    fullName: '$fullName',
                    clickAt: '$clickAt',
                    createdAt: '$createdAt',
                    description: '$description',
                    priority: '$priority',
                    statusClick: '$statusClick',
                    statusView: '$statusView',
                    updatedAt: '$updatedAt',
                    viewAt: '$viewAt',
                    viewed: '$viewed',

                    avatar: {
                        mediaBasePath: '$avatar.mediaBasePath',
                        mediaUri: '$avatar.mediaUri',
                        mediaType: '$avatar.mediaType',
                        mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

                    },

                }
            },
            {
                $sort: {
                    createdAt: - 1
                },

            },
        ]);
        return query;
    }

    async updatesdataUserId(adsID: string, userID: string, createUserAdsDto: CreateUserAdsDto): Promise<Object> {
        let data = await this.userAdsModel.updateOne(
            {
                "adsID": adsID,
                "userID": userID
            },
            {
                $set: {
                    "statusClick": createUserAdsDto.statusClick,
                    "statusView": createUserAdsDto.statusView,
                    "viewAt": createUserAdsDto.viewAt,
                    "viewed": createUserAdsDto.viewed,
                    "clickAt": createUserAdsDto.clickAt
                }
            });
        return data;
    }

    async updatesdataAdsID(adsID: string, createUserAdsDto: CreateUserAdsDto): Promise<Object> {
        let data = await this.userAdsModel.updateMany(
            {
                "adsID": adsID
            },
            {
                $set: {
                    "statusClick": createUserAdsDto.statusClick,
                    "statusView": createUserAdsDto.statusView,
                    "viewAt": createUserAdsDto.viewAt,
                    "viewed": createUserAdsDto.viewed,
                    "clickAt": createUserAdsDto.clickAt
                }
            });
        return data;
    }


}
