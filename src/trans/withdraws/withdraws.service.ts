import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateWithdrawsDto, OyDisburseCallbackWithdraw } from './dto/create-withdraws.dto';
import { Model, Types } from 'mongoose';
import { Withdraws, WithdrawsDocument } from './schemas/withdraws.schema';

@Injectable()
export class WithdrawsService {

    constructor(
        @InjectModel(Withdraws.name, 'SERVER_TRANS')
        private readonly withdrawsModel: Model<WithdrawsDocument>,
    ) { }

    async findAll(): Promise<Withdraws[]> {
        return this.withdrawsModel.find().exec();
    }

    async findOne(id: string): Promise<Withdraws> {
        return this.withdrawsModel.findOne({ _id: id }).exec();
    }

    async findParteneridtrx(partnerTrxid: string): Promise<Withdraws> {
        return this.withdrawsModel.findOne({ partnerTrxid: partnerTrxid }).exec();
    }
    async create(CreateWithdrawsDto: CreateWithdrawsDto): Promise<Withdraws> {
        let data = await this.withdrawsModel.create(CreateWithdrawsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async updateone(partnerTrxid: string, payload: OyDisburseCallbackWithdraw): Promise<Object> {
        let data = await this.withdrawsModel.updateOne({ "partnerTrxid": partnerTrxid },
            { $set: { "status": "success", "description": "Withdraw success", verified: true, payload: payload } });
        return data;
    }
}
