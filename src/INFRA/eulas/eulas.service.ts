import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEulasDto } from './dto/create-eulas.dto';
import { Eulas, EulasDocument } from './schemas/eulas.schema';
@Injectable()
export class EulasService {

    constructor(
        @InjectModel(Eulas.name) private readonly eulasModel: Model<EulasDocument>,
      ) {}
     
      async create(CreateEulasDto: CreateEulasDto): Promise<Eulas> {
        const createEulasDto = await this.eulasModel.create(CreateEulasDto);
        return createEulasDto;
      }
    
      async findAll(): Promise<Eulas[]> {
        return this.eulasModel.find().exec();
      }
      

       async findOne(id: string): Promise<Eulas> {
        return this.eulasModel.findOne({ _id: id }).exec();
      }
    
      async delete(id: string) {
        const deletedCat = await this.eulasModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }
}
