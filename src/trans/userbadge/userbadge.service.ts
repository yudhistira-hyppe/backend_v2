import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Userbadge, UserbadgeDocument } from './schemas/userbadge.schema';

@Injectable()
export class UserbadgeService {

    constructor(
        @InjectModel(Userbadge.name, 'SERVER_FULL')
        private readonly UserbadgeModel: Model<UserbadgeDocument>,
    ) { }

    async create(Userbadge_: Userbadge): Promise<Userbadge> {
        const _Userbadge_ = this.UserbadgeModel.create(Userbadge_);
        return _Userbadge_;
    }

    async findOne(id: string): Promise<Userbadge> {
        return this.UserbadgeModel.findOne({ _id: new Types.ObjectId(id) }).exec();
    }

    async find(): Promise<Userbadge[]> {
        return this.UserbadgeModel.find().exec();
    }

    async update(id: string, Userbadge_: Userbadge): Promise<Userbadge> {
        let data = await this.UserbadgeModel.findByIdAndUpdate(id, Userbadge_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }
}
