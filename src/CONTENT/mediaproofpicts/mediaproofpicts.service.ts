import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMediaproofpictsDto } from './dto/create-Mediaproofpicts.dto';
import { Mediaproofpicts, MediaproofpictsDocument } from './schemas/Mediaproofpicts.schema';

@Injectable()
export class MediaproofpictsService {

    constructor(
        @InjectModel(Mediaproofpicts.name) private readonly MediaproofpictsModel: Model<MediaproofpictsDocument>,
      ) {}
     
      async create(CreateMediaproofpictsDto: CreateMediaproofpictsDto): Promise<Mediaproofpicts> {
        const createMediaproofpictsDto = await this.MediaproofpictsModel.create(CreateMediaproofpictsDto);
        return createMediaproofpictsDto;
      }
    
      async findAll(): Promise<Mediaproofpicts[]> {
        return this.MediaproofpictsModel.find().exec();
      }
      

       async findOne(id: string): Promise<Mediaproofpicts> {
        return this.MediaproofpictsModel.findOne({ _id: id }).exec();
      }
  
      async delete(id: string) {
        const deletedCat = await this.MediaproofpictsModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }
}
