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

}
