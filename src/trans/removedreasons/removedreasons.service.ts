import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRemovedreasonsDto } from './dto/create-removedreasons.dto';
import { Removedreasons, RemovedreasonsDocument } from './schemas/removedreasons.schema';

@Injectable()
export class RemovedreasonsService {

    constructor(
        @InjectModel(Removedreasons.name, 'SERVER_FULL')
        private readonly levelticketsModel: Model<RemovedreasonsDocument>,
    ) { }

    async findAll(): Promise<Removedreasons[]> {
        return this.levelticketsModel.find().exec();
    }

    async findOne(id: string): Promise<Removedreasons> {
        return this.levelticketsModel.findOne({ _id: id }).exec();
    }
    async create(CreateRemovedreasonsDto: CreateRemovedreasonsDto): Promise<Removedreasons> {
        let data = await this.levelticketsModel.create(CreateRemovedreasonsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async update(
        id: string,
        CreateRemovedreasonsDto: CreateRemovedreasonsDto,
    ): Promise<Removedreasons> {
        let data = await this.levelticketsModel.findByIdAndUpdate(
            id,
            CreateRemovedreasonsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async delete(id: string) {
        const deleted = await this.levelticketsModel
            .findByIdAndRemove({ _id: id })
            .exec();
        return deleted;
    }
}
