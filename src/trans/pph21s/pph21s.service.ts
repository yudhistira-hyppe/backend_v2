import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePph21sDto } from './dto/create-pph21s.dto';
import { Pph21s, Pph21sDocument } from './schemas/pph21s.schema';

@Injectable()
export class Pph21sService {
    constructor(
        @InjectModel(Pph21s.name, 'SERVER_TRANS')
        private readonly pph21sModel: Model<Pph21sDocument>,
    ) { }

    async create(CreatePph21sDto: CreatePph21sDto): Promise<Pph21s> {
        let data = await this.pph21sModel.create(CreatePph21sDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }
}
