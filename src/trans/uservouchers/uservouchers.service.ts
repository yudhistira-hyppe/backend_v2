import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { CreateUservouchersDto } from './dto/create-uservouchers.dto';
import { Uservouchers, UservouchersDocument } from './schemas/uservouchers.schema';

@Injectable()
export class UservouchersService {
    constructor(
        @InjectModel(Uservouchers.name, 'SERVER_TRANS')
        private readonly uservouchersModel: Model<UservouchersDocument>

    ) { }
    async create(CreateUservouchersDto: CreateUservouchersDto): Promise<Uservouchers> {
        let data = await this.uservouchersModel.create(CreateUservouchersDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async findAll(): Promise<Uservouchers[]> {
        return this.uservouchersModel.find().exec();
    }

    async findOne(id: string): Promise<Uservouchers> {
        return this.uservouchersModel.findOne({ _id: id }).exec();
    }

    async findUser(userID: ObjectId): Promise<Uservouchers[]> {
        return this.uservouchersModel.find({ userID: userID, isActive: true }).exec();
    }


    async delete(id: string) {
        const deletedCat = await this.uservouchersModel
            .findByIdAndRemove({ _id: id })
            .exec();
        return deletedCat;
    }

    async update(
        id: string,
        createUservouchersDto: CreateUservouchersDto,
    ): Promise<Uservouchers> {
        let data = await this.uservouchersModel.findByIdAndUpdate(
            id,
            createUservouchersDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

}
