import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBanksDto } from './dto/create-banks.dto';
import { Banks, BanksDocument } from './schemas/banks.schema';

@Injectable()
export class BanksService {

    constructor(
        @InjectModel(Banks.name, 'SERVER_FULL')
        private readonly settingsModel: Model<BanksDocument>,
    ) { }

    async findAll(): Promise<Banks[]> {
        return this.settingsModel.find().exec();
    }

    async findOne(id: string): Promise<Banks> {
        return this.settingsModel.findOne({ _id: id }).exec();
    }

    async findbankcode(bankcode: string): Promise<Banks> {
        return this.settingsModel.findOne({ bankcode: bankcode }).exec();
    }


}
