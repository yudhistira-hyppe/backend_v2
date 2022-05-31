import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAreasDto } from './dto/create-areas.dto';
import { Areas, AreasDocument } from './schemas/areas.schema';

@Injectable()
export class AreasService {

    constructor(
        @InjectModel(Areas.name) private readonly areasModel: Model<AreasDocument>,
      ) {}
     
      async create(CreateAreasDto: CreateAreasDto): Promise<Areas> {
        const createAreasDto = await this.areasModel.create(CreateAreasDto);
        return createAreasDto;
      }
    
      async findAll(): Promise<Areas[]> {
        return this.areasModel.find().exec();
      }
      

      //  async findOne(id: string): Promise<Areas> {
      //   return this.areasModel.findOne({ _id: id }).exec();
      // }
      async findOne(countryID: String): Promise<Areas> {
        return this.areasModel.findOne({ countryID: countryID }).exec();
      }
      async delete(id: string) {
        const deletedCat = await this.areasModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }
}
