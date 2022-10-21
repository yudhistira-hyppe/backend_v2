import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateLevelticketsDto } from './dto/create-leveltickets.dto';
import { Leveltickets, LevelticketsDocument } from './schemas/leveltickets.schema';

@Injectable()
export class LevelticketsService {

    constructor(
        @InjectModel(Leveltickets.name, 'SERVER_FULL')
        private readonly levelticketsModel: Model<LevelticketsDocument>,
    ) { }

    async findAll(): Promise<Leveltickets[]> {
        return this.levelticketsModel.find().exec();
    }

    async findOne(id: string): Promise<Leveltickets> {
        return this.levelticketsModel.findOne({ _id: id }).exec();
    }
    async create(CreateLevelticketsDto: CreateLevelticketsDto): Promise<Leveltickets> {
        let data = await this.levelticketsModel.create(CreateLevelticketsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async update(
        id: string,
        CreateLevelticketsDto: CreateLevelticketsDto,
    ): Promise<Leveltickets> {
        let data = await this.levelticketsModel.findByIdAndUpdate(
            id,
            CreateLevelticketsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async delete(id: string) {
        const deleted = await this.levelticketsModel
            .findByIdAndRemove({ _id: id })
            .exec();
        return deleted;
    }
}
