import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserbasicDto } from './dto/create-userbasic.dto';
import { Userbasic, UserbasicDocument } from './schemas/userbasic.schema';

@Injectable()
export class UserbasicsService {

    constructor(
        @InjectModel(Userbasic.name) private readonly userbasicModel: Model<UserbasicDocument>,
      ) {}
    
      async create(CreateUserbasicDto: CreateUserbasicDto): Promise<Userbasic> {
        const createUserbasicDto = await this.userbasicModel.create(CreateUserbasicDto);
        return createUserbasicDto;
      }
    
      async findAll(): Promise<Userbasic[]> {
        return this.userbasicModel.find().exec();
      }
    
      // async findOne(id: string): Promise<Userbasic> {
      //   return this.userbasicModel.findOne({ _id: id }).exec();
      // }
      async findOne(email: string): Promise<Userbasic> {
        return this.userbasicModel.findOne({ email: email }).exec();
      }
      async delete(id: string) {
        const deletedCat = await this.userbasicModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }
}
