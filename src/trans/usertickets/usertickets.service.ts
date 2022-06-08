import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { CreateUserticketsDto } from './dto/create-usertickets.dto';
import { Usertickets, UserticketsDocument } from './schemas/usertickets.schema';
@Injectable()
export class UserticketsService {
    constructor(
        @InjectModel(Usertickets.name, 'SERVER_TRANS')
        private readonly userticketsModel: Model<UserticketsDocument>,
      
      ) {}
    async update(
        id: string,
        createUserticketsDto: CreateUserticketsDto,
      ): Promise<Usertickets> {
        let data = await this.userticketsModel.findByIdAndUpdate(
          id,
          createUserticketsDto,
          { new: true },
        );
    
        if (!data) {
          throw new Error('Todo is not found!');
        }
        return data;
      }

      async create(CreateUserticketsDto: CreateUserticketsDto): Promise<Usertickets> {
        let data = await this.userticketsModel.create(CreateUserticketsDto);
         
        if (!data) {
          throw new Error('Todo is not found!');
        }
        return data;
      }
}
