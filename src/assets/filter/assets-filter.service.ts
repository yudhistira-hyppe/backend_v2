import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateAssetsFilterDto } from './dto/create-assets-filter.dto';
import { AssetsFilter, AssetsFilterDocument } from './schemas/assets-filter.schema';

@Injectable()
export class AssetsFilterService {

    constructor(
        @InjectModel(AssetsFilter.name, 'SERVER_FULL')
        private readonly sourceFilterModel: Model<AssetsFilterDocument>,

    ) { }

    async create(CreateAssetsFilterDto_: CreateAssetsFilterDto): Promise<AssetsFilter> {
        return this.sourceFilterModel.create(CreateAssetsFilterDto_);
    }

    async find(assetsUser: mongoose.Types.ObjectId[]): Promise<AssetsFilter[]> {
        console.log(assetsUser);
        return this.sourceFilterModel.find({ _id: { $nin: assetsUser } });
    }

    async findGet(): Promise<AssetsFilter[]> {
        return this.sourceFilterModel.find({ "status":true, "$or": [ { "active":true }, { "active" : null } ] });
    }

    async findOne(id: string): Promise<AssetsFilter> {
        return await this.sourceFilterModel.findOne({ _id: Object(id) }).exec();
    }

    async indexConsole(keyword:string, startdate:string, enddate:string, kategori:any[], status:[], page:number, limit:number, sorting:boolean)
    {
        var pipeline = [];
        var firstmatch = [];

        if(keyword != null && keyword != undefined)
        {
            firstmatch.push(
                {
                    "namafile":
                    {
                        "$regex":keyword,
                        "$options":"i"
                    }
                }
            );
        }

        if(startdate != null)
        {
            var convertstart = startdate.split(" ")[0];
            
            try {
                var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));
                var dateend = currentdate.toISOString().split("T")[0];
            } catch (e) {
                dateend = enddate.substring(0,10);
            }

            firstmatch.push(
                {
                    "$and":
                    [
                        {
                            "createdAt":
                            {
                                "$gte":convertstart
                            }
                        },
                        {
                            "createdAt":
                            {
                                "$lt":dateend
                            }
                        }
                    ]
                }
            );
        }

        if(kategori != null)
        {
            var mongo = require('mongoose');
            var setkategori = [];
            for(var i = 0; i < kategori.length; i++)
            {
                setkategori.push(new mongo.Types.ObjectId(kategori[i]));
            }

            firstmatch.push(
                {
                    "category_id":
                    {
                        "$in":setkategori
                    }
                }
            );
        }

        if(status != null)
        {
            firstmatch.push(
                {
                    "status":
                    {
                        "$in":status
                    }
                }
            );
        }

        firstmatch.push(
            {
                "$or":
                [
                    {
                        "active":null
                    },
                    {
                        "active":
                        {
                            "$ne":false
                        }
                    }
                ]
            }
        );

        pipeline.push(
            {
                "$match":
                {
                    "$and":firstmatch
                }
            }
        );

        var setsorting = null;
        if(sorting == true)
        {
            setsorting = 1;
        }
        else
        {
            setsorting = -1;
        }

        pipeline.push(
            {
                "$sort":
                {
                    createdAt:setsorting
                }
            }
        );

        if(page != null && page != null)
        {
            pipeline.push(
                {
                    "$skip":(page * limit)
                }
            );
        }

        if(limit != null && limit != null)
        {
            pipeline.push(
                {
                    "$limit":limit
                }
            );
        }

        pipeline.push(
            {
                $lookup:
                    {
                        from: "filterCategory",
                        localField: "category_id",
                        foreignField: "_id",
                        as: "category_data"
                    }
            },
            {
                "$project":
                {
                    _id:1,
                    namafile:1,
                    descFile:1,
                    fileAssetName:1,
                    fileAssetBasePath:1,
                    fileAssetUri:1,
                    mediaName:1,
                    mediaBasePath:1,
                    mediaUri:1,
                    mediaThumName:1,
                    mediaThumBasePath:1,
                    mediaThumUri:1,
                    status:1,
                    createdAt:1,
                    updatedAt:1,
                    namaCategory:
                    {
                        "$ifNull":
                        [
                            {
                                "$arrayElemAt":
                                [
                                    "$category_data.name", 0
                                ]
                            },
                            null
                        ]
                    }
                }
            }
        );

        var setutil = require('util');
        console.log(setutil.inspect(pipeline, { depth:null, showHidden:false }));

        var result = await this.sourceFilterModel.aggregate(pipeline);
        return result;

    }

    async update(id: string, assetData: CreateAssetsFilterDto): Promise<AssetsFilter> {
        let data = await this.sourceFilterModel.findByIdAndUpdate(id, assetData, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }

    async detail(id:string)
    {
        var mongo = require('mongoose');
        var konvert = new mongo.Types.ObjectId(id);
        var query = await this.sourceFilterModel.aggregate([
            {
                "$match":
                {
                    "_id":konvert
                }
            },
            {
                "$facet":
                {
                    'detail':
                    [
                        {
                            $lookup:
                                {
                                    from: "filterCategory",
                                    localField: "category_id",
                                    foreignField: "_id",
                                    as: "category_data"
                                }
                        },
                        {
                            "$project":
                            {
                                "_id": 1,
                                "namafile": 1,
                                "fileAssetName": 1,
                                "fileAssetBasePath": 1,
                                "fileAssetUri": 1,
                                "mediaName": 1,
                                "mediaBasePath": 1,
                                "mediaUri": 1,
                                "mediaThumName": 1,
                                "mediaThumBasePath": 1,
                                "mediaThumUri": 1,
                                "status": 1,
                                "category_id": 1,
                                "namaCategory":
                                {
                                    "$ifNull":
                                    [
                                        {
                                            "$arrayElemAt":
                                            [
                                                "$category_data.name", 0
                                            ]
                                        },
                                        null
                                    ]
                                },
                                "createdAt": 1,
                                "updatedAt": 1
                            }
                        }
                    ]
                }
            },
            {
                "$project":
                {
                    "detail":
                    {
                        "$arrayElemAt":
                        [
                            "$detail", 0
                        ]
                    }
                }
            }
        ]);

        return query[0];
    }

}
