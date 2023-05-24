import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAdsplacesDto } from './dto/create-adsplaces.dto';
import { Adsplaces, AdsplacesDocument } from './schemas/adsplaces.schema';

@Injectable()
export class AdsplacesService {
    constructor(
        @InjectModel(Adsplaces.name, 'SERVER_FULL')
        private readonly adsplacesModel: Model<AdsplacesDocument>,
    ) { }

    async create(CreateAdsplacesDto: CreateAdsplacesDto): Promise<Adsplaces> {
        let data = await this.adsplacesModel.create(CreateAdsplacesDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async findAll(): Promise<Adsplaces[]> {
        return this.adsplacesModel.find().exec();
    }

    async findOne(id: string): Promise<Adsplaces> {
        return this.adsplacesModel.findOne({ _id: id }).exec();
    }

    async findOneByType(adsType: string): Promise<Adsplaces> {
        return this.adsplacesModel.findOne({ adsType: adsType }).exec();
    }

    async delete(id: string) {
        const deletedCat = await this.adsplacesModel
            .findByIdAndRemove({ _id: id })
            .exec();
        return deletedCat;
    }

    async update(
        id: string,
        createAdsplacesDto: CreateAdsplacesDto,
    ): Promise<Adsplaces> {
        let data = await this.adsplacesModel.findByIdAndUpdate(
            id,
            createAdsplacesDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async getAll(page:number, limit:number)
    {
        var pipeline = [];
        pipeline.push({
            "$lookup":
            {
                from: "adstypes",
                localField: "adsType",
                foreignField: "_id",
                as: "fk_docs"
            }
        },
        {
            "$project":
            {
                    _id:"$_id",
                    namePlace: "$namePlace",
                    descPlace: "$descPlace",
                    nameType: 
                    {
                        "$arrayElemAt":["$fk_docs.nameType", 0]
                    },
                    "creditValue": 
                    {
                        "$arrayElemAt":["$fk_docs.creditValue", 0]
                    },
                    "mediaType": 
                    {
                        "$arrayElemAt":["$fk_docs.mediaType", 0]
                    },
                    "sizeType": 
                    {
                        "$arrayElemAt":["$fk_docs.sizeType", 0]
                    },
                    "formatType": 
                    {
                        "$arrayElemAt":["$fk_docs.formatType", 0]
                    },
                    "descType": 
                    {
                        "$arrayElemAt":["$fk_docs.descType", 0]
                    },
                    "rewards": 
                    {
                        "$arrayElemAt":["$fk_docs.rewards", 0]
                    },
                    "AdsSkip": 
                    {
                        "$arrayElemAt":["$fk_docs.AdsSkip", 0]
                    },
                    "conterImpression": 
                    {
                        "$arrayElemAt":["$fk_docs.conterImpression", 0]
                    },
                    "descriptionMax": 
                    {
                        "$arrayElemAt":["$fk_docs.descriptionMax", 0]
                    },
                    "distanceArea": 
                    {
                        "$arrayElemAt":["$fk_docs.distanceArea", 0]
                    },
                    "durationMax": 
                    {
                        "$arrayElemAt":["$fk_docs.durationMax", 0]
                    },
                    "durationMin": 
                    {
                        "$arrayElemAt":["$fk_docs.durationMin", 0]
                    },
                    "intervalAds": 
                    {
                        "$arrayElemAt":["$fk_docs.intervalAds", 0]
                    },
                    "servingMultiplier": 
                    {
                        "$arrayElemAt":["$fk_docs.servingMultiplier", 0]
                    },
                    "sizeMax": 
                    {
                        "$arrayElemAt":["$fk_docs.sizeMax", 0]
                    },
                    "titleMax": {
                        "$arrayElemAt":["$fk_docs.titleMax", 0]
                    }
            }
        });

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

        var query = await this.adsplacesModel.aggregate(pipeline);
        return query;
    }

}
