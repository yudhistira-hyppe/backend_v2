import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Monetize, MonetizeDocument } from './schemas/monetization.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MonetizationService {
    constructor(
        @InjectModel(Monetize.name, 'SERVER_FULL')
        private readonly monetData: Model<MonetizeDocument>,
        private readonly configService: ConfigService,
      ) { }

    async find(): Promise<Monetize[]> {
        return this.monetData.find().exec();
    }

    async findOne(id:string): Promise<Monetize> {
        return this.monetData.findOne({ _id:id }).exec();
    }
}
