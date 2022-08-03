import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { GroupModuleDto } from './dto/groupmodule.dto'; 
import { GroupModule, GroupModuleDocument } from './schemas/groupmodule.schema';

@Injectable()
export class GroupModuleService {
    constructor(
        @InjectModel(GroupModule.name, 'SERVER_TRANS')
        private readonly moduleModel: Model<GroupModuleDocument>,
    ) {}

    async create(GroupModuleDto: GroupModuleDto): Promise<GroupModule> {
        let data = await this.moduleModel.create(GroupModuleDto);
        if (!data) {
            throw new Error('data is not found!');
        }
        return data;
    }

    async findAll(skip: number, limit: number): Promise<GroupModule[]> {
        return this.moduleModel.find().skip(skip).limit(limit).exec();
    }

    async findOne(_id: String): Promise<GroupModuleDto> {
        return this.moduleModel.findOne({ _id: _id }).exec();
    }

    async update(_id: String, GroupModuleDto: GroupModuleDto): Promise<Object> {
        return await this.moduleModel.updateOne({ _id: _id }, GroupModuleDto);
    }

    async delete(_id: String) {
        return await this.moduleModel.findByIdAndRemove({ _id: _id }).exec();
    }
}
