import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { InterestCountDto } from './dto/create-interest_count.dto';
import { InterestCount, InterestCountDocument } from './schemas/interest_count.schema';

@Injectable()
export class InterestCountService {
    constructor(
        @InjectModel(InterestCount.name, 'SERVER_FULL')
        private readonly interestCountModel: Model<InterestCountDocument>,
    ) { }

    async create(
        InterestCountDto: InterestCountDto,
    ): Promise<InterestCount> {
        const interestCountDto = await this.interestCountModel.create(
            InterestCountDto,
        );
        return interestCountDto;
    }

    async findAll(): Promise<InterestCount[]> {
        return this.interestCountModel.find().exec();
    }

    async findOneById(id: string): Promise<InterestCount> {
        return this.interestCountModel
            .findOne({ _id: new Types.ObjectId(id) })
            .exec();
    }

    async update(
        id: string,
        tagCountDto: InterestCountDto,
    ): Promise<InterestCount> {
        let data = await this.interestCountModel.findByIdAndUpdate(
            id,
            tagCountDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

}
