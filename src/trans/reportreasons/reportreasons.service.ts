import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReportreasonsDto } from './dto/create-reportreasons.dto';
import { Reportreasons, ReportreasonsDocument } from './schemas/reportreasons.schema';

@Injectable()
export class ReportreasonsService {
    constructor(
        @InjectModel(Reportreasons.name, 'SERVER_TRANS')
        private readonly reportreasonsModel: Model<ReportreasonsDocument>,
    ) { }
    async findAll(): Promise<Reportreasons[]> {
        return this.reportreasonsModel.find().exec();
    }

    async findOne(id: string): Promise<Reportreasons> {
        return this.reportreasonsModel.findOne({ _id: id }).exec();
    }

    async findType(type: string): Promise<Reportreasons[]> {
        return this.reportreasonsModel.find({ type: type }).exec();
    }
    async create(CreateReportreasonsDto: CreateReportreasonsDto): Promise<Reportreasons> {
        let data = await this.reportreasonsModel.create(CreateReportreasonsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async update(
        id: string,
        CreateReportreasonsDto: CreateReportreasonsDto,
    ): Promise<Reportreasons> {
        let data = await this.reportreasonsModel.findByIdAndUpdate(
            id,
            CreateReportreasonsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async delete(id: string) {
        const deleted = await this.reportreasonsModel
            .findByIdAndRemove({ _id: id })
            .exec();
        return deleted;
    }
}
