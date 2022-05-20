import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateContenteventsDto } from './dto/create-contentevents.dto';
import { Contentevents, ContenteventsDocument } from './schemas/contentevents.schema';

@Injectable()
export class ContenteventsService {

    constructor(
        @InjectModel(Contentevents.name) private readonly ContenteventsModel: Model<ContenteventsDocument>,
      ) {}
     
      async create(CreateContenteventsDto: CreateContenteventsDto): Promise<Contentevents> {
        const createContenteventsDto = await this.ContenteventsModel.create(CreateContenteventsDto);
        return createContenteventsDto;
      }
    
      async findAll(): Promise<Contentevents[]> {
        return this.ContenteventsModel.find().exec();
      }
      

    //    async findOne(id: string): Promise<Contentevents> {
    //     return this.ContenteventsModel.findOne({ _id: id }).exec();
    //   }
    async findOne(email: string): Promise<Contentevents> {
        return this.ContenteventsModel.findOne({ email: email }).exec();
      }
      async delete(id: string) {
        const deletedCat = await this.ContenteventsModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }
}
