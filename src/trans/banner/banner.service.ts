import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Banner, BannerDocument } from './schemas/banner.schema';

@Injectable()
export class BannerService {

    constructor(
        @InjectModel(Banner.name, 'SERVER_FULL')
        private readonly BannerModel: Model<BannerDocument>,
    ) { }

    async create(Banner_: Banner): Promise<Banner> {
        const _Banner_ = await this.BannerModel.create(Banner_);
        return _Banner_;
    }

    async findOne(id: string): Promise<Banner> {
        return this.BannerModel.findOne({ _id: new Types.ObjectId(id) }).exec();
    }

    async find(): Promise<Banner[]> {
        return this.BannerModel.find().exec();
    }

    async update(id: string, Banner_: Banner): Promise<Banner> {
        let data = await this.BannerModel.findByIdAndUpdate(id, Banner_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }

    async delete(id: string) {
        const data = await this.BannerModel.findByIdAndRemove({ _id: new Types.ObjectId(id) }).exec();
        return data;
    }
    async updateNonactive(id: string): Promise<Object> {
        let data = await this.BannerModel.updateOne({ "_id": id },
            {
                $set: {
                    "active": false
                }
            });
        return data;
    }

}
