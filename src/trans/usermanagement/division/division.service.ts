import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { DivisionDto } from './dto/division.dto';
import { Division, DivisionDocument } from './schemas/division.schema';

@Injectable()
export class DivisionService {
    constructor(
        @InjectModel(Division.name, 'SERVER_FULL')
        private readonly divisionModel: Model<DivisionDocument>
    ) { }

    async create(GroupDto: DivisionDto): Promise<Division> {
        let data = await this.divisionModel.create(GroupDto);
        if (!data) {
            throw new Error('data is not found!');
        }
        return data;
    }

    async findAll(search: string, skip: number, limit: number): Promise<Division[]> {
        return this.divisionModel.find({ nameDivision: { $regex: search } }).skip(skip).limit(limit).exec();
    }

    async findAllCount(search: string): Promise<Division[]> {
        return this.divisionModel.find({ nameDivision: { $regex: search } }).exec();
    }

    async findAllnoSkip(): Promise<Division[]> {
        return this.divisionModel.find().exec();
    }

    async findOne(_id: String): Promise<Division> {
        return this.divisionModel.findOne({ _id: _id }).exec();
    }

    async findOnebyName(nameDivision: String): Promise<Division> {
        return this.divisionModel.findOne({ nameDivision: nameDivision }).exec();
    }

    async update(_id: String, GroupDto: DivisionDto): Promise<Object> {
        return await this.divisionModel.updateOne({ _id: _id }, GroupDto);
    }

    async delete(_id: String) {
        return await this.divisionModel.findByIdAndRemove({ _id: _id }).exec();
    }

    async listGroupUserAll() {
        var query = await this.divisionModel.aggregate([
            {
                $lookup: {
                    from: "group",
                    localField: "_id",
                    foreignField: "divisionId",
                    as: "group"
                }
            },

        ]);

        return query;
    }
}
