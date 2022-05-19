import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDomaineventsDto } from './dto/create-domainevents.dto';
import { Domainevents, DomaineventsDocument } from './schemas/domainevents.schema';

@Injectable()
export class DomaineventsService {

    constructor(
        @InjectModel(Domainevents.name) private readonly domaineventsModel: Model<DomaineventsDocument>,
      ) {}
     
      async create(CreateDomaineventsDto: CreateDomaineventsDto): Promise<Domainevents> {
        const createDomaineventsDto = await this.domaineventsModel.create(CreateDomaineventsDto);
        return createDomaineventsDto;
      }
    
      async findAll(): Promise<Domainevents[]> {
        return this.domaineventsModel.find().exec();
      }
      

       async findOne(id: string): Promise<Domainevents> {
        return this.domaineventsModel.findOne({ _id: id }).exec();
      }
    
      async delete(id: string) {
        const deletedCat = await this.domaineventsModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }
}
