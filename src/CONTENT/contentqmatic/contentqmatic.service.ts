import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateContentqmaticDto } from './dto/create-Contentqmatic.dto';
import { Contentqmatic, ContentqmaticDocument } from './schemas/Contentqmatic.schema';

@Injectable()
export class ContentqmaticService {

    constructor(
        @InjectModel(Contentqmatic.name) private readonly ContentqmaticModel: Model<ContentqmaticDocument>,
      ) {}
     
      async create(CreateContentqmaticDto: CreateContentqmaticDto): Promise<Contentqmatic> {
        const createContentqmaticDto = await this.ContentqmaticModel.create(CreateContentqmaticDto);
        return createContentqmaticDto;
      }
    
      async findAll(): Promise<Contentqmatic[]> {
        return this.ContentqmaticModel.find().exec();
      }
      

       async findOne(id: string): Promise<Contentqmatic> {
        return this.ContentqmaticModel.findOne({ _id: id }).exec();
      }
    
      async delete(id: string) {
        const deletedCat = await this.ContentqmaticModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }
}
