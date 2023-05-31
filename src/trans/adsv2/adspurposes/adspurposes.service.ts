import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AdsPurposes, AdsPurposesDocument } from "./schema/adspurposes.schema";
import { Model } from "mongoose";
import { AdsPurposesDto } from "./dto/adspurposes.dto";

@Injectable()
export class AdsPurposesService {

    constructor(
        @InjectModel(AdsPurposes.name, 'SERVER_FULL')
        private readonly adspurposesModel: Model<AdsPurposesDocument>,
    ) { }

    async create(AdsPurposesDto_: AdsPurposesDto): Promise<AdsPurposes> {
        const _AdsPurposesDto_ = await this.adspurposesModel.create(AdsPurposesDto_);
        return _AdsPurposesDto_;
    }

    async update(_id: string, AdsPurposesDto_: AdsPurposesDto) {
        const _AdsPurposesDto_ = this.adspurposesModel.updateOne(
            { _id: Object(_id) },
            AdsPurposesDto_,
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            });
    }

    async findOne(id: string): Promise<AdsPurposes> {
        return await this.adspurposesModel.findOne({ _id: Object(id) }).exec();
    }

    async delete(id: string) {
        this.adspurposesModel.deleteOne({ _id: Object(id) }).exec();
    }

    async filAll(): Promise<AdsPurposes[]> {
        return await this.adspurposesModel.find().exec();
    }

    async find(AdsPurposesDto_: AdsPurposesDto): Promise<AdsPurposes[]> {
        return await this.adspurposesModel.find(AdsPurposesDto_).exec();
    }

    async findCriteria(pageNumber: number, pageRow: number, search: string, langIso: string): Promise<AdsPurposes[]> {
        var perPage = pageRow, page = Math.max(0, pageNumber);
        var where = {
            $and: []
        };
        var where_and = {};
        var where_name = {};
        if (search != undefined) {
            if (langIso == "en") {
                where['$or'] = [];
                where_name['namePurposes_en'] = { $regex: search, $options: "i" };
                where['$or'].push(where_name);
            } else {
                where['$or'] = [];
                where_name['namePurposes_id'] = { $regex: search, $options: "i" };
                where['$or'].push(where_name);
            }
        }
        where.$and.push(where_and);
        const query = await this.adspurposesModel.find(where).limit(perPage).skip(perPage * page).sort({ namePurposes: 'desc' });
        return query;
    }
}