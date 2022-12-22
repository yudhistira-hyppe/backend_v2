import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeepArDto } from './dto/create-deepar.dto';
import { DeepAr, DeepArDocument } from './schemas/deepar.schema';

@Injectable()
export class DeepArService {
    constructor(
        @InjectModel(DeepAr.name, 'SERVER_FULL')
        private readonly deepArModel: Model<DeepArDocument>,
    ) { }

    async findOne(id: string): Promise<DeepAr> {
        return this.deepArModel.findOne({ _id: id }).exec();
    }
}
