import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AdsObjectivitas, AdsObjectivitasDocument } from "./schema/adsobjectivitas.schema";
import { Model } from "mongoose";
import { AdsObjectivitasDto } from "./dto/adsobjectivitas.dto";

@Injectable()
export class AdsObjectivitasService {

    constructor(
        @InjectModel(AdsObjectivitas.name, 'SERVER_FULL')
        private readonly adspurposesModel: Model<AdsObjectivitasDocument>,
    ) { }

    async create(AdsObjectivitasDto_: AdsObjectivitasDto): Promise<AdsObjectivitas> {
        const _AdsObjectivitasDto_ = await this.adspurposesModel.create(AdsObjectivitasDto_);
        return _AdsObjectivitasDto_;
    }

    async update(_id: string, AdsObjectivitasDto: AdsObjectivitasDto) {
        let data = await this.adspurposesModel.findByIdAndUpdate(
            _id,
            AdsObjectivitasDto,
            { new: true });
        return data;
    }

    async findOne(id: string): Promise<AdsObjectivitas> {
        return await this.adspurposesModel.findOne({ _id: Object(id) }).exec();
    }

    async delete(id: string) {
        this.adspurposesModel.deleteOne({ _id: Object(id) }).exec();
    }

    async filAll(): Promise<AdsObjectivitas[]> {
        return await this.adspurposesModel.find().exec();
    }

    async find(AdsObjectivitasDto_: AdsObjectivitasDto): Promise<AdsObjectivitas[]> {
        return await this.adspurposesModel.find(AdsObjectivitasDto_).exec();
    }

    async findCriteria(pageNumber: number, pageRow: number, search: string, langIso: string): Promise<AdsObjectivitas[]> {
        var perPage = pageRow, page = Math.max(0, pageNumber);
        var where = {
            $and: []
        };
        var where_and = {};
        var where_name = {};
        if (search != undefined) {
            if (langIso == "en") {
                where['$or'] = [];
                where_name['name_en'] = { $regex: search, $options: "i" };
                where['$or'].push(where_name);
            } else {
                where['$or'] = [];
                where_name['name_id'] = { $regex: search, $options: "i" };
                where['$or'].push(where_name);
            }
        }
        where.$and.push(where_and);
        const query = await this.adspurposesModel.find(where).limit(perPage).skip(perPage * page).sort({ namePurposes: 'desc' });
        return query;
    }
}