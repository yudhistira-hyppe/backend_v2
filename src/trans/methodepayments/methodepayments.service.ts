
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMethodepaymentsDto } from './dto/create-methodepayments.dto';
import { Methodepayments, MethodepaymentsDocument } from './schemas/methodepayments.schema';
@Injectable()
export class MethodepaymentsService {

    constructor(
        @InjectModel(Methodepayments.name, 'SERVER_FULL')
        private readonly methodepaymentsModel: Model<Methodepayments>,
    ) { }

    async findAll(): Promise<Methodepayments[]> {
        return this.methodepaymentsModel.find().exec();
    }

    async findOne(id: string): Promise<Methodepayments> {
        return this.methodepaymentsModel.findOne({ _id: id }).exec();
    }

    async findmethodename(methodename: string): Promise<Methodepayments> {
        return this.methodepaymentsModel.findOne({ methodename: methodename }).exec();
    }
}
