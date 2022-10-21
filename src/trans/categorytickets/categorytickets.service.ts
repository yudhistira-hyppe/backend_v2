import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryticketsDto } from './dto/create-categorytickets.dto';
import { Categorytickets, CategoryticketsDocument } from './schemas/categorytickets.schema';

@Injectable()
export class CategoryticketsService {
    constructor(
        @InjectModel(Categorytickets.name, 'SERVER_FULL')
        private readonly categoryticketsModel: Model<CategoryticketsDocument>,
    ) { }

    async findAll(): Promise<Categorytickets[]> {
        return this.categoryticketsModel.find().exec();
    }

    async findOne(id: string): Promise<Categorytickets> {
        return this.categoryticketsModel.findOne({ _id: id }).exec();
    }
    async create(CreateCategoryticketsDto: CreateCategoryticketsDto): Promise<Categorytickets> {
        let data = await this.categoryticketsModel.create(CreateCategoryticketsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async update(
        id: string,
        CreateCategoryticketsDto: CreateCategoryticketsDto,
    ): Promise<Categorytickets> {
        let data = await this.categoryticketsModel.findByIdAndUpdate(
            id,
            CreateCategoryticketsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async delete(id: string) {
        const deleted = await this.categoryticketsModel
            .findByIdAndRemove({ _id: id })
            .exec();
        return deleted;
    }

}
