import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMediaprofilepictsDto } from './dto/create-Mediaprofilepicts.dto';
import { Mediaprofilepicts, MediaprofilepictsDocument } from './schemas/Mediaprofilepicts.schema';

@Injectable()
export class MediaprofilepictsService {
    constructor(
        @InjectModel(Mediaprofilepicts.name) private readonly MediaprofilepictsModel: Model<MediaprofilepictsDocument>,
      ) {}
     
      async create(CreateMediaprofilepictsDto: CreateMediaprofilepictsDto): Promise<Mediaprofilepicts> {
        const createMediaprofilepictsDto = await this.MediaprofilepictsModel.create(CreateMediaprofilepictsDto);
        return createMediaprofilepictsDto;
      }
    
      async findAll(): Promise<Mediaprofilepicts[]> {
        return this.MediaprofilepictsModel.find().exec();
      }
      

       async findOne(id: string): Promise<Mediaprofilepicts> {
        return this.MediaprofilepictsModel.findOne({ _id: id }).exec();
      }
  
      async delete(id: string) {
        const deletedCat = await this.MediaprofilepictsModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }
}
