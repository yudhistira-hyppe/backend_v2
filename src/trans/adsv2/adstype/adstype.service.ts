import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdsTypeDto } from './dto/adstype.dto';
import { AdsType, AdsTypeDocument } from './schemas/adstype.schema';

@Injectable()
export class AdsTypeService {
    constructor(
        @InjectModel(AdsType.name, 'SERVER_FULL')
        private readonly adstypeModel: Model<AdsTypeDocument>,
    ) { }

    async create(AdsTypeDto_: AdsTypeDto): Promise<AdsType> {
        const _AdsTypeDto_ = await this.adstypeModel.create(AdsTypeDto_);
        return _AdsTypeDto_;
    }

    async update(_id: string, AdsTypeDto_: AdsTypeDto) {
        let data = await this.adstypeModel.findByIdAndUpdate(
            _id ,
            AdsTypeDto_,
            { new: true });
        return data;
    }

    async findOne(id: string): Promise<AdsType> {
        return await this.adstypeModel.findOne({ _id: Object(id) }).exec();
    }

    async delete(id: string) {
        this.adstypeModel.deleteOne({ _id: Object(id) }).exec();
    }

    async filAll(): Promise<AdsType[]> {
        return await this.adstypeModel.find().exec();
    }

    async find(AdsTypeDto_: AdsTypeDto): Promise<AdsType[]> {
        return await this.adstypeModel.find(AdsTypeDto_).exec();
    }
    
    async findCriteria(pageNumber: number, pageRow: number, search: string): Promise<AdsType[]> {
        var perPage = pageRow, page = Math.max(0, pageNumber);
        var where = {
            $and: []
        };
        var where_and = {};
        var where_name = {};
        if (search != undefined) {
            where_name['nameType'] = { $regex: search, $options: "i" };
            where['$or'].push(where_name);
        }
        where.$and.push(where_and);
        const query = await this.adstypeModel.find(where).limit(perPage).skip(perPage * page).sort({ nameType: -1 });
        return query;
    }
}
