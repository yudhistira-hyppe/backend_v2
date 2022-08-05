import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { GroupDto } from './dto/group.dto';
import { Group, GroupDocument } from './schemas/group.schema';

@Injectable()
export class GroupService {
    constructor(
        @InjectModel(Group.name, 'SERVER_TRANS')
        private readonly groupModel: Model<GroupDocument>
    ) {}

    async create(GroupDto: GroupDto): Promise<Group> {
        let data = await this.groupModel.create(GroupDto);
        if (!data) {
            throw new Error('data is not found!');
        }
        return data;
    }

    async findAll(skip: number, limit: number): Promise<Group[]> {
        return this.groupModel.find().skip(skip).limit(limit).exec();
    }

    async findAllnoSkip(): Promise<Group[]> {
        return this.groupModel.find().exec();
    }

    async findOne(_id: String): Promise<Group> {
        return this.groupModel.findOne({ _id: _id }).exec();
    }

    async update(_id: String, GroupDto: GroupDto): Promise<Object> {
        return await this.groupModel.updateOne({ _id: _id }, GroupDto);
    }

    async delete(_id: String) {
        return await this.groupModel.findByIdAndRemove({ _id: _id }).exec();
    }

    async findbyuser(_id: String) {
        return await this.groupModel.find({userbasics: {$in: [_id]}}).exec();
    }
}
