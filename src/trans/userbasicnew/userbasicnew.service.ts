import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Userbasicnew, UserbasicnewDocument } from './schemas/userbasicnew.schema';

@Injectable()
export class UserbasicnewService {
    constructor(
        @InjectModel(Userbasicnew.name, 'SERVER_FULL')
        private readonly UserbasicnewModel: Model<UserbasicnewDocument>,
    ) { }

    async create(Userbasicnew_: Userbasicnew): Promise<Userbasicnew> {
        const _Userbasicnew_ = await this.UserbasicnewModel.create(Userbasicnew_);
        return _Userbasicnew_;
    }
    async findOne(id: string): Promise<Userbasicnew> {
        return this.UserbasicnewModel.findOne({ _id: new Types.ObjectId(id) }).exec();
    }
    async find(): Promise<Userbasicnew[]> {
        return this.UserbasicnewModel.find().exec();
    }

    async update(id: string, Userbasicnew_: Userbasicnew): Promise<Userbasicnew> {
        let data = await this.UserbasicnewModel.findByIdAndUpdate(id, Userbasicnew_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }

    async delete(id: string) {
        const data = await this.UserbasicnewModel.findByIdAndRemove({ _id: new Types.ObjectId(id) }).exec();
        return data;
    }

}
