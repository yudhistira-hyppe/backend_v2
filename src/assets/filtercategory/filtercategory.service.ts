import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { CreateFilterDto } from './dto/create-filter.dto';
import { Filtercategory, filterCategoryDocument } from './schemas/filtercategory.schema';

@Injectable()
export class FiltercategoryService {
    constructor(
        @InjectModel(Filtercategory.name, 'SERVER_FULL')
        private readonly dataMM: Model<filterCategoryDocument>
    ) { }

    async create(data:Filtercategory)
    {
        return this.dataMM.create(data);
    }

    async update(id: string, data: Filtercategory) 
    {
        let result = await this.dataMM.findByIdAndUpdate(new Types.ObjectId(id), data, { new: true });
        if (!result) {
            throw new Error('Data is not found!');
        }
        return data;
    }

    async listing(keyword:string, limit:number, page:number)
    {
        var pipeline = [];

        var firstmatch = [];
        if(keyword != null)
        {
            firstmatch.push(
                {
                    "name":
                    {
                        "$regex":keyword,
                        "$options":"i"
                    }
                }
            );
        }

        firstmatch.push(
            {
                "active":true
            }
        );

        pipeline.push(
            {
                "$match":
                {
                    "$and":firstmatch
                }
            },
            {
                "$sort":
                {
                    "createdAt":1
                }
            }
        );

        if(page != null && page > 0)
        {
            pipeline.push(
                {
                    "$skip":(page * limit)
                }
            );
        }

        if(limit != null && limit > 0)
        {
            pipeline.push(
                {
                    "$limit":limit
                }
            );
        }

        var data = await this.dataMM.aggregate(pipeline);

        return data;
    }

    async findOne(id:string)
    {
        var result = await this.dataMM.findOne({ _id: new Types.ObjectId(id) }).exec();
        return result;
    }
}
