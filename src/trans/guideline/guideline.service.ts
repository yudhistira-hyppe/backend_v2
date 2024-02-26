import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Guideline, GuidelineDocument } from './schemas/guideline.schema';

@Injectable()
export class GuidelineService {
    constructor(
        @InjectModel(Guideline.name, 'SERVER_FULL')
        private readonly guidelineModel: Model<GuidelineDocument>
    ) { }

    async findById(id: string): Promise<Guideline> {
        return this.guidelineModel.findById(id);
    }
    async findByName(name: string): Promise<Guideline> {
        return this.guidelineModel.findOne({ name: name });
    }
    async create(CreateGuidelineDto: any): Promise<Guideline> {
        let data = await this.guidelineModel.create(CreateGuidelineDto);
        if (!data) throw new Error('Todo is not found');
        return data;
    }
    async delete(id: string): Promise<Guideline> {
        let data = await this.guidelineModel.findByIdAndUpdate(id, {
            isActive: false,
            updatedAt: new Date(Date.now())
        }, { new: true });
        if (!data) throw new Error('Todo is not found');
        return data;
    }
    async update(id: string, CreateGuidelineDto: any): Promise<Guideline> {
        let data_old = await this.guidelineModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!data_old) throw new Error('Old todo is not found');
        else {
            CreateGuidelineDto._id = new mongoose.Types.ObjectId();
            CreateGuidelineDto.createdAt = data_old.createdAt;
            CreateGuidelineDto.createdBy = data_old.createdBy;
            CreateGuidelineDto.status = 'DRAFT';
            CreateGuidelineDto.isActive = true;
            CreateGuidelineDto.approvedBy = null;
            let data = await this.guidelineModel.create(CreateGuidelineDto);
            if (!data) throw new Error('Todo is not found');
            return data;
        }
    }
    async listAll(skip: number, limit: number, descending: boolean, isActive: boolean): Promise<any> {
        let order = descending ? -1 : 1;
        let pipeline = [];
        pipeline.push({
            "$sort":
            {
                'createdAt': order
            }
        });
        if (isActive !== undefined) {
            pipeline.push({
                "$match":
                {
                    'isActive': isActive
                }
            })
        }
        pipeline.push({
            "$lookup":
            {
                from: 'newUserBasics',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'creator'
            },
        },
            {
                "$lookup":
                {
                    from: 'newUserBasics',
                    localField: 'approvedBy',
                    foreignField: '_id',
                    as: 'approver'
                },
            },
            {
                "$project":
                {
                    _id: 1,
                    name: 1,
                    title_id: 1,
                    title_en: 1,
                    value_id: 1,
                    value_en: 1,
                    updatedAt: 1,
                    isActive: 1,
                    status: 1,
                    approvedAt: 1,
                    creatorUsername: {
                        $arrayElemAt: ['$creator.username', 0]
                    },
                    creatorFullname: {
                        $arrayElemAt: ['$creator.fullName', 0]
                    },
                    creatorAvatar: {
                        mediaBasePath: {
                            $arrayElemAt: ['$creator.mediaBasePath', 0]
                        },
                        mediaUri: {
                            $arrayElemAt: ['$creator.mediaUri', 0]
                        },
                        mediaEndpoint: {
                            $arrayElemAt: ['$creator.mediaEndpoint', 0]
                        },
                    },
                    approverUsername: {
                        $arrayElemAt: ['$approver.username', 0]
                    },
                    approverFullname: {
                        $arrayElemAt: ['$approver.fullName', 0]
                    },
                    approverAvatar: {
                        mediaBasePath: {
                            $arrayElemAt: ['$approver.mediaBasePath', 0]
                        },
                        mediaUri: {
                            $arrayElemAt: ['$approver.mediaUri', 0]
                        },
                        mediaEndpoint: {
                            $arrayElemAt: ['$approver.mediaEndpoint', 0]
                        },
                    }
                },
            });
        if (skip > 0) {
            pipeline.push({ $skip: skip });
        }
        if (limit > 0) {
            pipeline.push({ $limit: limit });
        }
        let data = await this.guidelineModel.aggregate(pipeline);
        return data;
    }
}