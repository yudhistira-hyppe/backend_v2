import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { AdsPriceCredits, AdsPriceCreditsDocument } from './schema/adspricecredits.schema';

@Injectable()
export class AdsPriceCreditsService {
    constructor(
        @InjectModel(AdsPriceCredits.name, 'SERVER_FULL')
        private readonly AdsPriceCreditsModel: Model<AdsPriceCreditsDocument>,
    ) { }

    async create(AdsPriceCredits_: AdsPriceCredits): Promise<AdsPriceCredits> {
        await this.updateStatus();
        const _AdsPriceCredits_ = await this.AdsPriceCreditsModel.create(AdsPriceCredits_);
        return _AdsPriceCredits_;
    }

    async findOne(id: string): Promise<AdsPriceCredits> {
        return this.AdsPriceCreditsModel.findOne({ _id: new Types.ObjectId(id) }).exec();
    }

    async findStatusActive(): Promise<AdsPriceCredits> {
        return this.AdsPriceCreditsModel.findOne({ status: true }).exec();
    }

    async updateStatus() {
        let data = await this.AdsPriceCreditsModel.updateMany({ status: true },
            { $set: { status: false } }, { new: true });
        return data;
    }

    async update(_id: string, AdsPriceCredits_: AdsPriceCredits): Promise<Object> {
        let data = await this.AdsPriceCreditsModel.findByIdAndUpdate(new mongoose.Types.ObjectId(_id), AdsPriceCredits_, { new: true });
        return data;
    }
}
