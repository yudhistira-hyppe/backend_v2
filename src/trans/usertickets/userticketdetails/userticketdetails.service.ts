import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { CreateUserticketdetailsDto } from './dto/create-userticketdetails.dto';
import { Userticketdetails, UserticketdetailsDocument } from './schemas/userticketdetails.schema';
@Injectable()
export class UserticketdetailsService {
    constructor(
        @InjectModel(Userticketdetails.name, 'SERVER_TRANS')
        private readonly userticketsModel: Model<UserticketdetailsDocument>,

    ) { }
    async create(CreateUserticketdetailsDto: CreateUserticketdetailsDto): Promise<Userticketdetails> {
        let data = await this.userticketsModel.create(CreateUserticketdetailsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }
}
