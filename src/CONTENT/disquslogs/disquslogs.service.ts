import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDisquslogsDto } from './dto/create-Disquslogs.dto';
import { Disquslogs, DisquslogsDocument } from './schemas/Disquslogs.schema';

@Injectable()
export class DisquslogsService {
    constructor(
        @InjectModel(Disquslogs.name) private readonly DisquslogsModel: Model<DisquslogsDocument>,
      ) {}
     
      async create(CreateDisquslogsDto: CreateDisquslogsDto): Promise<Disquslogs> {
        const createDisquslogsDto = await this.DisquslogsModel.create(CreateDisquslogsDto);
        return createDisquslogsDto;
      }
    
      async findAll(): Promise<Disquslogs[]> {
        return this.DisquslogsModel.find().exec();
      }
      

       async findOne(id: string): Promise<Disquslogs> {
        return this.DisquslogsModel.findOne({ _id: id }).exec();
      }
   
      async delete(id: string) {
        const deletedCat = await this.DisquslogsModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }
}
