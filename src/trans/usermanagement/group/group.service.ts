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

    async findAll(search:string, skip: number, limit: number): Promise<Group[]> {
        return this.groupModel.find({ nameGroup: { $regex: search }}).skip(skip).limit(limit).exec();
    }

    async findAllCount(search: string): Promise<Group[]> {
        return this.groupModel.find({ nameGroup: { $regex: search } }).exec();
    }

    async findAllnoSkip(): Promise<Group[]> {
        return this.groupModel.find().exec();
    }

    async findOne(_id: String): Promise<Group> {
        return this.groupModel.findOne({ _id: _id }).exec();
    }

    async findOnebyName(nameGroup: String): Promise<Group> {
        return this.groupModel.findOne({ nameGroup: nameGroup }).exec();
    }

    async update(_id: String, GroupDto: GroupDto): Promise<Object> {
        return await this.groupModel.updateOne({ _id: _id }, GroupDto);
    }

    async delete(_id: String) {
        return await this.groupModel.findByIdAndRemove({ _id: _id }).exec();
    }

    async deleteUserGroup(_id: String, userId: String) {
        return await this.groupModel.updateOne({ _id: _id }, { $pull: { userbasics: Object(userId) } }).exec();
    }

    async addUserGroup(_id: String, userId: String) {
        return await this.groupModel.updateOne({ _id: _id }, { $push: { userbasics: Object(userId) } }).exec();
    }

    async findbyuser(_id: String) {
        return await this.groupModel.find({userbasics: {$in: [_id]}}).exec();
    }

    // async validasiUserGroup(email: String) {
    //     return await this.groupModel.find({ userbasics: { $in: [_id] } }).exec();
    // }
}
