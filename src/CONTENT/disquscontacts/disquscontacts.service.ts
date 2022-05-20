import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDisquscontactsDto } from './dto/create-Disquscontacts.dto';
import { Disquscontacts, DisquscontactsDocument } from './schemas/Disquscontacts.schema';

@Injectable()
export class DisquscontactsService {
    constructor(
        @InjectModel(Disquscontacts.name) private readonly DisquscontactsModel: Model<DisquscontactsDocument>,
      ) {}
     
      async create(CreateDisquscontactsDto: CreateDisquscontactsDto): Promise<Disquscontacts> {
        const createDisquscontactsDto = await this.DisquscontactsModel.create(CreateDisquscontactsDto);
        return createDisquscontactsDto;
      }
    
      async findAll(): Promise<Disquscontacts[]> {
        return this.DisquscontactsModel.find().exec();
      }
      

    //    async findOne(id: string): Promise<Disquscontacts> {
    //     return this.DisquscontactsModel.findOne({ _id: id }).exec();
    //   }
    async findOne(email: string): Promise<Disquscontacts> {
        return this.DisquscontactsModel.findOne({ email: email }).exec();
      }
      async delete(id: string) {
        const deletedCat = await this.DisquscontactsModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }
}
