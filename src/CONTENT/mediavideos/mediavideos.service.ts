import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMediavideosDto } from './dto/create-Mediavideos.dto';
import { Mediavideos, MediavideosDocument } from './schemas/Mediavideos.schema';

@Injectable()
export class MediavideosService {

    constructor(
        @InjectModel(Mediavideos.name) private readonly MediavideosModel: Model<MediavideosDocument>,
      ) {}
     
      async create(CreateMediavideosDto: CreateMediavideosDto): Promise<Mediavideos> {
        const createMediavideosDto = await this.MediavideosModel.create(CreateMediavideosDto);
        return createMediavideosDto;
      }
    
      async findAll(): Promise<Mediavideos[]> {
        return this.MediavideosModel.find().exec();
      }
      

       async findOne(id: string): Promise<Mediavideos> {
        return this.MediavideosModel.findOne({ _id: id }).exec();
      }
  
      async delete(id: string) {
        const deletedCat = await this.MediavideosModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }
}
