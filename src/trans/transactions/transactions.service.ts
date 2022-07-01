import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTransactionsDto } from './dto/create-transactions.dto';
import { Transactions, TransactionsDocument } from './schemas/transactions.schema';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectModel(Transactions.name, 'SERVER_TRANS')
        private readonly transactionsModel: Model<TransactionsDocument>,

    ) { }

    async findAll(): Promise<Transactions[]> {
        return this.transactionsModel.find().exec();
    }

    async findOne(noinvoice: string): Promise<Transactions> {
        return this.transactionsModel.findOne({ noinvoice: noinvoice }).exec();
    }

    async create(CreateTransactionsDto: CreateTransactionsDto): Promise<Transactions> {
        let data = await this.transactionsModel.create(CreateTransactionsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async update(
        id: string,
        createTransactionsDto: CreateTransactionsDto,
    ): Promise<Transactions> {
        let data = await this.transactionsModel.findByIdAndUpdate(
            id,
            createTransactionsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }
}
