import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserauthDto } from './dto/create-userauth.dto';
import { Userauth, UserauthDocument } from './schemas/userauth.schema';

@Injectable()
export class UserauthsService {

    constructor(
        @InjectModel(Userauth.name) private readonly userauthModel: Model<UserauthDocument>,
      ) {}
     
      async create(CreateUserauthDto: CreateUserauthDto): Promise<Userauth> {
        const createUserauthDto = await this.userauthModel.create(CreateUserauthDto);
        return createUserauthDto;
      }
    
      async findAll(): Promise<Userauth[]> {
        return this.userauthModel.find().exec();
      }
      // async findOne(username: string): Promise<Userauth> {
      //   return this.userauthModel.findOne({ username: username }).exec();
      // }

      async findOne(email: string): Promise<Userauth> {
        return this.userauthModel.findOne({ email: email }).exec();
      }
      // async findOneId(id: string): Promise<Userauth> {
      //   return this.userauthModel.findOne({ _id: id }).exec();
      // }
     
      async delete(id: string) {
        const deletedCat = await this.userauthModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }
}
