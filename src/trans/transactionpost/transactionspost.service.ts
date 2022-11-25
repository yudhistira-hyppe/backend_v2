import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Transactions, TransactionsDocument } from "../transactions/schemas/transactions.schema";

@Injectable()
export class TransactionsPostService {
    constructor(
        @InjectModel(Transactions.name, 'SERVER_FULL')
        private readonly transactionsModel: Model<TransactionsDocument>,

    ) { }

    async findpostid(postid: string): Promise<Transactions> {
        return this.transactionsModel.findOne({ postid: postid }).exec();
    }
}
