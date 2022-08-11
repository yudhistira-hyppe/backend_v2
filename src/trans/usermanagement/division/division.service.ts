import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { DivisionDto } from './dto/division.dto';
import { Division, DivisionDocument } from './schemas/division.schema';

@Injectable()
export class DivisionService {
    constructor(
        @InjectModel(Division.name, 'SERVER_TRANS')
        private readonly divisionModel: Model<DivisionDocument>
    ) {}

    async create(GroupDto: DivisionDto): Promise<Division> {
        let data = await this.divisionModel.create(GroupDto);
        if (!data) {
            throw new Error('data is not found!');
        }
        return data;
    }

    async findAll(skip: number, limit: number): Promise<Division[]> {
        return this.divisionModel.find().skip(skip).limit(limit).exec();
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
}
