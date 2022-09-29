import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateLogapsarasDto } from './dto/create-logapsaras.dto';
import { Logapsaras, LogapsarasDocument } from './schemas/logapsaras.schema';

@Injectable()
export class LogapsarasService {

    constructor(
        @InjectModel(Logapsaras.name, 'SERVER_TRANS')
        private readonly logapsarasModel: Model<LogapsarasDocument>,
    ) { }

    async findAll(): Promise<Logapsaras[]> {
        return this.logapsarasModel.find().exec();
    }

    async findOne(id: string): Promise<Logapsaras> {
        return this.logapsarasModel.findOne({ _id: id }).exec();
    }

    async findbankcode(bankcode: string): Promise<Logapsaras> {
        return this.logapsarasModel.findOne({ bankcode: bankcode }).exec();
    }
}
