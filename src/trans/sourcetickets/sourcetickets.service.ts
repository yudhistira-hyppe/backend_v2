import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSourceticketsDto } from './dto/create-sourcetickets.dto';
import { Sourcetickets, SourceticketsDocument } from './schemas/sourcetickets.schema';

@Injectable()
export class SourceticketsService {

    constructor(
        @InjectModel(Sourcetickets.name, 'SERVER_TRANS')
        private readonly sourceticketsModel: Model<SourceticketsDocument>,
    ) { }

    async findAll(): Promise<Sourcetickets[]> {
        return this.sourceticketsModel.find().exec();
    }

    async findOne(id: string): Promise<Sourcetickets> {
        return this.sourceticketsModel.findOne({ _id: id }).exec();
    }
    async create(CreateSourceticketsDto: CreateSourceticketsDto): Promise<Sourcetickets> {
        let data = await this.sourceticketsModel.create(CreateSourceticketsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async update(
        id: string,
        CreateSourceticketsDto: CreateSourceticketsDto,
    ): Promise<Sourcetickets> {
        let data = await this.sourceticketsModel.findByIdAndUpdate(
            id,
            CreateSourceticketsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async delete(id: string) {
        const deleted = await this.sourceticketsModel
            .findByIdAndRemove({ _id: id })
            .exec();
        return deleted;
    }
}
