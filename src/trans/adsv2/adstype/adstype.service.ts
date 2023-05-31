import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdsTypeDto } from './dto/adstype.dto';
import { Adstype, AdstypeDocument } from './schemas/adstype.schema';

@Injectable()
export class AdstypeService {
    constructor(
        @InjectModel(Adstype.name, 'SERVER_FULL')
        private readonly adstypeModel: Model<AdstypeDocument>,
    ) { }

    async create(AdsTypeDto_: AdsTypeDto): Promise<Adstype> {
        let data = await this.adstypeModel.create(AdsTypeDto_);
        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async findAll(): Promise<Adstype[]> {
        return this.adstypeModel.find().exec();
    }

    async findPlaces(): Promise<Adstype[]> {
        let query = await this.adstypeModel.aggregate([

            {
                $lookup: {
                    from: "adsplaces",
                    localField: "_id",
                    foreignField: "adsType",
                    as: "adsplaces"
                }
            },
            {
                $project: {
                    _id: "$_id",
                    nameType: "$nameType",
                    creditValue: "$creditValue",
                    adsplaces: "$adsplaces"
                }
            }

        ]);

        return query;
    }

    async findOne(id: Object): Promise<Adstype> {
        return this.adstypeModel.findOne({ _id: id }).exec();
    }

    async delete(id: string) {
        const deletedCat = await this.adstypeModel
            .findByIdAndRemove({ _id: id })
            .exec();
        return deletedCat;
    }

    async update(
        id: string,
        AdsTypeDto_: AdsTypeDto,
    ): Promise<Adstype> {
        let data = await this.adstypeModel.findByIdAndUpdate(
            id,
            AdsTypeDto_,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async getAll(page:number, limit:number) {
        var pipeline = [];

        if(page > 0)
        {
            pipeline.push({
                "$skip":limit * page
            });
        }

        if(limit > 0)
        {
            pipeline.push({   
                "$limit":limit
            });
        }

        var query = await this.adstypeModel.aggregate(pipeline);
        return query;
    }

}
