import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { InterestCountDto } from './dto/create-interest_count.dto';
import { InterestCount, InterestCountDocument } from './schemas/interest_count.schema';

@Injectable()
export class InterestCountService {
    constructor(
        @InjectModel(InterestCount.name, 'SERVER_FULL')
        private readonly interestCountModel: Model<InterestCountDocument>,
    ) { }

    async create(
        InterestCountDto: InterestCountDto,
    ): Promise<InterestCount> {
        const interestCountDto = await this.interestCountModel.create(
            InterestCountDto,
        );
        return interestCountDto;
    }

    async findAll(): Promise<InterestCount[]> {
        return this.interestCountModel.find().exec();
    }

    async findOneById(id: string): Promise<InterestCount> {
        return this.interestCountModel
            .findOne({ _id: new Types.ObjectId(id) })
            .exec();
    }

    async update(
        id: string,
        tagCountDto: InterestCountDto,
    ): Promise<InterestCount> {
        let data = await this.interestCountModel.findByIdAndUpdate(
            id,
            tagCountDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async searchDefaultPage(page: number, limits: number)
    {
        var pipeline = [];
        var pipelinetag = [];

        pipelinetag.push({
            $project: {
                tag: "$_id",
                total: 1,
                
            }
        },
        {
            $sort: {
                total: - 1
            }
        });

        if(limits > 0)
        {
            pipeline.push({
                "$limit":limits
            });

            pipelinetag.push({
                "$limit" : limits
            });
        }

        if(page > 0)
        {
            pipelinetag.push({
                "$skip" : limits * page
            });
        }

        pipeline.push(
            {
                $sort: {
                    total: - 1
                }
            },
            {
                $lookup: 
                {
                    from: "interests_repo",
                    localField: "_id",
                    foreignField: "_id",
                    as: "interest"
                }
            },
            {
                $unwind: {
                    path: "$interest"
                }
            },
            {
                $lookup: {
                    from: "tag_count",
                    pipeline: pipelinetag,
                    as: "tag"
                },
            },
            {
                $project: {
                    interest: {
                        interests: "$interest.interestName",
                        interestName: "$interest.interestName",
                        langIso: "$interest.langIso",
                        icon: "$interest.icon",
                        createdAt: "$interest.createdAt",
                        updatedAt: "$interest.updatedAt",
                        interestNameId: "$interest.interestNameId",
                        thumbnail: "$interest.thumbnail",
                    },
                    tag: "$tag"
                }
            });


        // console.log(JSON.stringify(pipeline));
        var query = await this.interestCountModel.aggregate(pipeline);

        return query;
    }
}
