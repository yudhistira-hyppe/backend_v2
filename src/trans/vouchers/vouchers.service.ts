import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { CreateVouchersDto } from './dto/create-vouchers.dto';
import { Vouchers, VouchersDocument } from './schemas/vouchers.schema';

@Injectable()
export class VouchersService {

    constructor(
        @InjectModel(Vouchers.name, 'SERVER_TRANS')
        private readonly vouchersModel: Model<VouchersDocument>

    ) { }
    async create(CreateVouchersDto: CreateVouchersDto): Promise<Vouchers> {
        let data = await this.vouchersModel.create(CreateVouchersDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async findAll(): Promise<Vouchers[]> {
        return this.vouchersModel.find().exec();
    }

    async findOne(id: string): Promise<Vouchers> {
        return this.vouchersModel.findOne({ _id: id }).exec();
    }

    async delete(id: string) {
        const deletedCat = await this.vouchersModel
            .findByIdAndRemove({ _id: id })
            .exec();
        return deletedCat;
    }

    async update(
        id: string,
        createVouchersDto: CreateVouchersDto,
    ): Promise<Vouchers> {
        let data = await this.vouchersModel.findByIdAndUpdate(
            id,
            createVouchersDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

}
