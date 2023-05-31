import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AdsBalaceCredit, AdsBalaceCreditDocument } from "./schema/adsbalacecredit.schema";
import { Model } from "mongoose";
import { AdsBalaceCreditDto } from "./dto/adsbalacecredit.dto";

@Injectable()
export class AdsBalaceCreditService {

    constructor(
        @InjectModel(AdsBalaceCredit.name, 'SERVER_FULL')
        private readonly adspurposesModel: Model<AdsBalaceCreditDocument>,
    ) { }

    async create(AdsBalaceCreditDto_: AdsBalaceCreditDto): Promise<AdsBalaceCredit> {
        const _AdsBalaceCreditDto_ = await this.adspurposesModel.create(AdsBalaceCreditDto_);
        return _AdsBalaceCreditDto_;
    }

    async update(_id: string, AdsBalaceCreditDto_: AdsBalaceCreditDto) {
        const _AdsBalaceCreditDto_ = this.adspurposesModel.updateOne(
            { _id: Object(_id) },
            AdsBalaceCreditDto_,
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            });
    }

    async delete(id: string) {
        this.adspurposesModel.deleteOne({ _id: Object(id) }).exec();
    }

    async filAll(): Promise<AdsBalaceCredit[]> {
        return await this.adspurposesModel.find().exec();
    }

    async find(AdsPurposesDto_: AdsBalaceCreditDto): Promise<AdsBalaceCredit[]> {
        return await this.adspurposesModel.find(AdsPurposesDto_).exec();
    }

    async findOne(id: string): Promise<AdsBalaceCredit> {
        return await this.adspurposesModel.findOne({ _id: Object(id) }).exec();
    }
}