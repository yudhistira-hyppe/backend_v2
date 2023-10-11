import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { AdsRewards, AdsRewardsDocument } from './schema/adsrewards.schema';

@Injectable()
export class AdsRewardsService {
    constructor(
        @InjectModel(AdsRewards.name, 'SERVER_FULL')
        private readonly AdsRewardsModel: Model<AdsRewardsDocument>,
    ) { }

    async create(AdsRewards_: AdsRewards): Promise<AdsRewards> {
        await this.updateStatus(AdsRewards_.idAdsType.toString());
        const _AdsPriceCredits_ = await this.AdsRewardsModel.create(AdsRewards_);
        return _AdsPriceCredits_;
    }

    async findOne(id: string): Promise<AdsRewards> {
        return this.AdsRewardsModel.findOne({ _id: new Types.ObjectId(id) }).exec();
    }

    async findStatusActive(idadstype:string): Promise<AdsRewards> {
        return this.AdsRewardsModel.findOne({ status: true, idAdsType: new mongoose.Types.ObjectId(idadstype)}).exec();
    }

    async updateStatus(idadstype: string) {
        let data = await this.AdsRewardsModel.updateMany({ status: true, idAdsType: new mongoose.Types.ObjectId(idadstype) },
            { $set: { status: false } }, { new: true });
        return data;
    }

    async update(_id: string, AdsRewards_: AdsRewards): Promise<Object> {
        let data = await this.AdsRewardsModel.findByIdAndUpdate(new mongoose.Types.ObjectId(_id), AdsRewards_, { new: true });
        return data;
    }
}
