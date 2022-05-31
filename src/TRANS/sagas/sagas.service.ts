import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSagasDto } from './dto/create-sagas.dto';
import { Sagas, SagasDocument } from './schemas/sagas.schema';

@Injectable()
export class SagasService {
    constructor(
        @InjectModel(Sagas.name) private readonly sagasModel: Model<SagasDocument>,
      ) {}
    
      async create(CreateSagasDto: CreateSagasDto): Promise<Sagas> {
        const createSagasDto = await this.sagasModel.create(CreateSagasDto);
        return createSagasDto;
      }
    
      async findAll(): Promise<Sagas[]> {
        return this.sagasModel.find().exec();
      }
    
      async findOne(id: string): Promise<Sagas> {
        return this.sagasModel.findOne({ _id: id }).exec();
      }
    
      async delete(id: string) {
        const deletedCat = await this.sagasModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }
}
