import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMediastoriesDto } from './dto/create-Mediastories.dto';
import { Mediastories, MediastoriesDocument } from './schemas/Mediastories.schema';

@Injectable()
export class MediastoriesService {
    constructor(
        @InjectModel(Mediastories.name) private readonly MediastoriesModel: Model<MediastoriesDocument>,
      ) {}
     
      async create(CreateMediastoriesDto: CreateMediastoriesDto): Promise<Mediastories> {
        const createMediastoriesDto = await this.MediastoriesModel.create(CreateMediastoriesDto);
        return createMediastoriesDto;
      }
    
      async findAll(): Promise<Mediastories[]> {
        return this.MediastoriesModel.find().exec();
      }
      

       async findOne(id: string): Promise<Mediastories> {
        return this.MediastoriesModel.findOne({ _id: id }).exec();
      }
  
      async delete(id: string) {
        const deletedCat = await this.MediastoriesModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }

}
