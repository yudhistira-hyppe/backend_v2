import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTransactionsDto, VaCallback } from './dto/create-transactions.dto';
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

    async findid(id: string): Promise<Transactions> {
        return this.transactionsModel.findOne({ _id: id }).exec();
    }

    async findpostidpost(postid: string): Promise<Transactions> {
        return this.transactionsModel.findOne({ postid: postid }).exec();
    }

    async findpostid(postid: string): Promise<Transactions> {
        return this.transactionsModel.findOne({ postid: postid, status: "success" }).exec();
    }

    async findpostidpending(postid: string): Promise<Transactions> {
        return this.transactionsModel.findOne({ postid: postid, status: "pending" }).exec();
    }
    async findva(nova: string): Promise<Transactions> {
        return this.transactionsModel.findOne({ nova: nova }).exec();
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

    async updateone(id: Types.ObjectId, idaccountbalance: Types.ObjectId, payload: VaCallback): Promise<Object> {
        let data = await this.transactionsModel.updateOne({ "_id": id },
            { $set: { "status": "success", "description": "buy success content", "accountbalance": idaccountbalance, payload: payload } });
        return data;
    }

    async updatestatuscancel(id: Types.ObjectId): Promise<Object> {
        let data = await this.transactionsModel.updateOne({ "_id": id },
            { $set: { "status": "cancel", "description": "VA expired time" } });
        return data;
    }
}
