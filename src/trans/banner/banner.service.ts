import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Banner, BannerDocument } from './schemas/banner.schema';
import { first, pipe } from 'rxjs';

@Injectable()
export class BannerService {

    constructor(
        @InjectModel(Banner.name, 'SERVER_FULL')
        private readonly BannerModel: Model<BannerDocument>,
    ) { }

    async create(Banner_: Banner): Promise<Banner> {
        const _Banner_ = await this.BannerModel.create(Banner_);
        return _Banner_;
    }

    async findOne(id: string): Promise<Banner> {
        return this.BannerModel.findOne({ _id: new Types.ObjectId(id) }).exec();
    }

    async findOne2(id: string) {
        var mongo = require('mongoose');
        var konvertid = mongo.Types.ObjectId(id);

        var pipeline = [];
        pipeline.push({
            "$match":
            {
                _id:konvertid
            }
        },
        {
            $lookup: 
            {
                from: 'userbasics',
                localField: 'email',
                foreignField: 'email',
                as: 'basic_data',
            }
        },
        {
            "$project":
            {
                _id:1,
                title:1,
                url:1,
                image:1,
                createdAt:1,
                email:1,
                statusTayang:1,
                active:1,
                fullName:
                {
                    "$arrayElemAt":
                    [
                        "$basic_data.fullName",0
                    ]
                }
            }
        });
        
        var query = await this.BannerModel.aggregate(pipeline);

        return query[0];
    }

    async find(): Promise<Banner[]> {
        return this.BannerModel.find().exec();
    }

    async update(id: string, Banner_: Banner): Promise<Banner> {
        let data = await this.BannerModel.findByIdAndUpdate(id, Banner_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }

    async delete(id: string) {
        const data = await this.BannerModel.findByIdAndRemove({ _id: new Types.ObjectId(id) }).exec();
        return data;
    }
    async updateNonactive(id: string): Promise<Object> {
        let data = await this.BannerModel.updateOne({ "_id": id },
            {
                $set: {
                    "active": false,
                    "statusTayang":false
                }
            });
        return data;
    }

    async listing(keyword:string, statustayang:boolean, startdate:string, enddate:string, page:number, limit:number, sorting: boolean)
    {
        var pipeline = [];
        pipeline.push(
            {
                "$match":
                {
                    "$expr":
                    {
                        "$eq":
                        [
                            "$active",
                            true
                        ]
                    }
                }
            },
            {
                "$lookup":
                {
                    from:"userbasics",
                    as:"basic_data",
                    let:
                    {
                        basic_fk:"$email"
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
                                        "$email", "$$basic_fk"
                                    ]
                                }
                            }
                        },
                    ]
                }
            },
            {
                "$project":
                {
                    _id:1,
                    title:1,
                    url:1,
                    image:1,
                    createdAt:1,
                    statusTayang:1,
                    fullName:
                    {
                        "$arrayElemAt":
                        [
                            "$basic_data.fullName", 0
                        ]
                    }
                }
            }
        );

        var firstmatch = [];
        if(keyword != null && keyword != undefined)
        {
            firstmatch.push(
                {
                    title:
                    {
                        "$regex":keyword,
                        "$options":"i"
                    }
                },
            );
        }

        if(statustayang != null && statustayang != undefined)
        {
            firstmatch.push(
                {
                    "$expr":
                    {
                        "$eq":
                        [
                            "$statusTayang", statustayang
                        ]
                    }
                },
            );
        }

        if(startdate != null && startdate != undefined)
        {
            firstmatch.push(
                {
                    "$expr":
                    {
                        "$gte":
                        [
                            "$createdAt",
                            startdate
                        ]
                    }
                },
                {
                    "$expr":
                    {
                        "$lte":
                        [
                            "$createdAt",
                            enddate
                        ]
                    }
                },
            );
        }

        if(firstmatch.length != 0)
        {
            pipeline.push(
                {
                    "$match":
                    {
                        "$and":firstmatch
                    }
                }
            );
        }

        if(sorting != null)
        {
            var setascending = null;
            if (sorting == true) {
                setascending = 1;
            }
            else {
                setascending = -1;
            }

            pipeline.push({
                "$sort":
                {
                    "createdAt": setascending
                }
            });
        }

        if(page > 0)
        {
            pipeline.push(
                {
                    "$skip": (page * limit)
                }
            );
        }

        if(limit > 0)
        {
            pipeline.push(
                {
                    "$limit":limit
                }
            );
        }

        var query = await this.BannerModel.aggregate(pipeline);

        return query;
    }

}
