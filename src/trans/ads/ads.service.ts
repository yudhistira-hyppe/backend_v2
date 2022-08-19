import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateAdsDto } from './dto/create-ads.dto';
import { Ads, AdsDocument } from './schemas/ads.schema';

@Injectable()
export class AdsService {
    constructor(
        @InjectModel(Ads.name, 'SERVER_TRANS')
        private readonly adsModel: Model<AdsDocument>,
    ) { }

    async create(CreateAdsDto: CreateAdsDto): Promise<Ads> {
        let data = await this.adsModel.create(CreateAdsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async findAll(): Promise<Ads[]> {
        return this.adsModel.find().exec();
    }

    async findOne(id: string): Promise<Ads> {
        return this.adsModel.findOne({ _id: id }).exec();
    }

    async delete(id: string) {
        const deletedCat = await this.adsModel
            .findByIdAndRemove({ _id: id })
            .exec();
        return deletedCat;
    }

    async update(
        id: string,
        createAdsDto: CreateAdsDto,
    ): Promise<Ads> {
        let data = await this.adsModel.findByIdAndUpdate(
            id,
            createAdsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async updateStatusView(id: Types.ObjectId, totalView: number): Promise<Object> {
        let data = await this.adsModel.updateOne({ "_id": id },
            { $set: { "totalView": totalView } });
        return data;
    }

    async updateStatusClick(id: Types.ObjectId, totalClick: number): Promise<Object> {
        let data = await this.adsModel.updateOne({ "_id": id },
            { $set: { "totalClick": totalClick } });
        return data;
    }

}
