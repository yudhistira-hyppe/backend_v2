import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { InterestdayDto } from './dto/create-interestday.dto';
import { Interestday, InterestdayDocument } from './schemas/interestday.schema';

@Injectable()
export class InterestdayService {
    constructor(
        @InjectModel(Interestday.name, 'SERVER_FULL')
        private readonly interestdayModel: Model<InterestdayDocument>,
    ) { }

    async create(
        InterestdayDto: InterestdayDto,
    ): Promise<Interestday> {
        const interestdayDto = await this.interestdayModel.create(
            InterestdayDto,
        );
        return interestdayDto;
    }

    async findAll(): Promise<Interestday[]> {
        return this.interestdayModel.find().exec();
    }

    async findOneById(id: string, date: string): Promise<Interestday> {
        return this.interestdayModel
            .findOne({ _id: new Types.ObjectId(id), date: date })
            .exec();
    }

    async update(
        id: string,
        interestdayDto: Interestday,
    ): Promise<Interestday> {
        let data = await this.interestdayModel.findByIdAndUpdate(
            id,
            interestdayDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

}
