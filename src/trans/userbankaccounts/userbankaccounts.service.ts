import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserbankaccountsDto } from './dto/create-userbankaccounts.dto';
import { Model, Types } from 'mongoose';
import { Userbankaccounts, UserbankaccountsDocument } from './schemas/userbankaccounts.schema';
import { ObjectId } from 'mongodb';

@Injectable()
export class UserbankaccountsService {
    constructor(
        @InjectModel(Userbankaccounts.name, 'SERVER_TRANS')
        private readonly userbankaccountsModel: Model<UserbankaccountsDocument>,
    ) { }

    async findAll(): Promise<Userbankaccounts[]> {
        return this.userbankaccountsModel.find().exec();
    }

    async findOneUser(iduser: ObjectId): Promise<Userbankaccounts[]> {
        return this.userbankaccountsModel.find({ userId: iduser }).exec();
    }
    async findOne(id: string): Promise<Userbankaccounts> {
        return this.userbankaccountsModel.findOne({ _id: id }).exec();
    }

    async findnorekkembar(noRek: string): Promise<Userbankaccounts> {
        return this.userbankaccountsModel.findOne({ noRek: noRek }).exec();
    }
    async findnorek(noRek: string, idBank: string): Promise<Userbankaccounts> {
        return this.userbankaccountsModel.findOne({ noRek: noRek, idBank: idBank }).exec();
    }

    async findnorekWithdraw(noRek: string, idBank: string, nama: string): Promise<Userbankaccounts> {
        return this.userbankaccountsModel.findOne({ noRek: noRek, idBank: idBank, nama: nama }).exec();
    }
    async create(CreateUserbankaccountsDto: CreateUserbankaccountsDto): Promise<Userbankaccounts> {
        let data = await this.userbankaccountsModel.create(CreateUserbankaccountsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async updateone(id: Types.ObjectId, description: string): Promise<Object> {
        let data = await this.userbankaccountsModel.updateOne({ "_id": id },
            { $set: { "statusInquiry": true, "description": description } });
        return data;
    }


    async update(
        id: string,
        createUserbankaccountsDto: CreateUserbankaccountsDto,
    ): Promise<Userbankaccounts> {
        let data = await this.userbankaccountsModel.findByIdAndUpdate(
            id,
            createUserbankaccountsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

}
