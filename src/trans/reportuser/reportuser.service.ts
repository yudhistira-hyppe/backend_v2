import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CreateReportsuserDto } from './dto/create-reportuser.dto';
import { Reportuser, ReportuserDocument } from './schemas/reportuser.schema';

@Injectable()
export class ReportuserService {

    constructor(
        @InjectModel(Reportuser.name, 'SERVER_TRANS')
        private readonly reportuserModel: Model<ReportuserDocument>,
    ) { }
    async findAll(): Promise<Reportuser[]> {
        return this.reportuserModel.find().exec();
    }

    async findOne(id: string): Promise<Reportuser> {
        return this.reportuserModel.findOne({ _id: id }).exec();
    }
    async findType(reportTypeId: string): Promise<Reportuser> {
        return this.reportuserModel.findOne({ reportTypeId: reportTypeId }).exec();
    }
    async updateid(id: ObjectId): Promise<Object> {
        let data = await this.reportuserModel.updateOne({ "_id": id },
            { $set: { "isRemoved": true } });
        return data;
    }

    async findIsremoved(isRemoved: boolean): Promise<Reportuser> {
        return this.reportuserModel.findOne({ isRemoved: isRemoved }).exec();
    }
    async create(CreateReportsuserDto: CreateReportsuserDto): Promise<Reportuser> {
        let data = await this.reportuserModel.create(CreateReportsuserDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async update(
        id: string,
        CreateReportsuserDto: CreateReportsuserDto,
    ): Promise<Reportuser> {
        let data = await this.reportuserModel.findByIdAndUpdate(
            id,
            CreateReportsuserDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async delete(id: string) {
        const deleted = await this.reportuserModel
            .findByIdAndRemove({ _id: id })
            .exec();
        return deleted;
    }
}
